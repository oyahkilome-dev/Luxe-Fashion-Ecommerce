import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useProductStore } from '../../../store/productStore';
import { ProductVariant } from '../../../data/mockProducts';
import { Image as ImageIcon, Trash2, Star, UploadCloud, X } from 'lucide-react';

export const ProductsView = () => {
  const { products, fetchProducts } = useProductStore();
  
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProductId, setCurrentProductId] = useState<string | null>(null);
  
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    name: '', slug: '', description: '', price: 0, original_price: 0,
    category_id: '', brand_id: '', stock_quantity: 0, in_stock: true,
    is_new: false, is_featured: false
  });
  
  const [variants, setVariants] = useState<Partial<ProductVariant>[]>([]);
  const [images, setImages] = useState<{ url: string, file?: File, isPrimary: boolean, isNew?: boolean, id?: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{type: 'success'|'error', text: string} | null>(null);

  useEffect(() => {
    fetchProducts();
    fetchCategoriesAndBrands();
  }, [fetchProducts]);

  const fetchCategoriesAndBrands = async () => {
    const { data: catData } = await supabase.from('categories').select('*');
    if (catData) setCategories(catData);
    const { data: brandData } = await supabase.from('brands').select('*');
    if (brandData) setBrands(brandData);
  };

  const handleAddNew = () => {
    setFormData({
      name: '', slug: '', description: '', price: 0, original_price: 0,
      category_id: '', brand_id: '', stock_quantity: 0, in_stock: true,
      is_new: false, is_featured: false
    });
    setVariants([]);
    setImages([]);
    setCurrentProductId(null);
    setIsAdding(true);
    setIsEditing(false);
  };

  const handleEdit = async (product: any) => {
    setFormData({
      name: product.name,
      slug: product.slug || '',
      description: product.description || '',
      price: product.price || 0,
      original_price: product.originalPrice || 0,
      category_id: product.category_id || (categories.find(c => c.name === product.category)?.id) || '',
      brand_id: product.brand_id || (brands.find(b => b.name === product.brand)?.id) || '',
      stock_quantity: product.stockQuantity || 0,
      in_stock: product.inStock,
      is_new: product.isNew || false,
      is_featured: product.isFeatured || false,
    });
    
    setVariants(product.variants || []);
    
    // Fetch actual images from DB to get their IDs and primary status
    const { data: imageRows } = await supabase.from('product_images').select('*').eq('product_id', product.id).order('display_order');
    if (imageRows && imageRows.length > 0) {
      setImages(imageRows.map(img => ({ url: img.image_url, isPrimary: img.is_primary, id: img.id })));
    } else {
      // fallback to basic strings if populated that way
      setImages((product.images || []).map((url: string, idx: number) => ({ url, isPrimary: idx === 0 })));
    }
    
    setCurrentProductId(product.id);
    setIsEditing(true);
    setIsAdding(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files as FileList);
    
    const newImages = files.map(file => ({
      url: URL.createObjectURL(file),
      file,
      isPrimary: images.length === 0, // First image is primary by default
      isNew: true
    }));
    
    setImages([...images, ...newImages]);
  };
  
  const setPrimaryImage = (index: number) => {
    setImages(images.map((img, i) => ({ ...img, isPrimary: i === index })));
  };
  
  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let productId = currentProductId;
      
      const productPayload = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: formData.description,
        price: formData.price,
        original_price: formData.original_price || null,
        category_id: formData.category_id || null,
        brand_id: formData.brand_id || null,
        stock_quantity: formData.stock_quantity,
        in_stock: formData.in_stock,
        is_new: formData.is_new,
        is_featured: formData.is_featured
      };
      
      if (isAdding) {
        const { data, error } = await supabase.from('products').insert(productPayload).select('id').single();
        if (error) throw error;
        productId = data.id;
      } else if (isEditing && productId) {
        const { error } = await supabase.from('products').update(productPayload).eq('id', productId);
        if (error) throw error;
      }

      if (productId) {
        // Upload new images to Supabase Storage
        const uploadedImageUrls = [];
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          if (img.isNew && img.file) {
            const fileExt = img.file.name.split('.').pop();
            const fileName = `${productId}-${Date.now()}-${i}.${fileExt}`;
            const { error: uploadError, data } = await supabase.storage.from('product-images').upload(fileName, img.file);
            
            if (uploadError) {
              console.error("Upload error:", uploadError);
              throw new Error("Failed to upload image.");
            }
            const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
            img.url = publicUrl;
          }
        }
        
        // Update product_images table
        // First delete images that are no longer in the list
        const existingImageIds = images.filter(img => !img.isNew && img.id).map(img => img.id);
        if (existingImageIds.length > 0) {
            const { error: delErr } = await supabase.from('product_images').delete().eq('product_id', productId).not('id', 'in', `(${existingImageIds.join(',')})`);
            if (delErr) throw new Error("Failed to clean up old images: " + delErr.message);
        } else {
            // Delete all if none are retained
            const { error: delErr } = await supabase.from('product_images').delete().eq('product_id', productId);
            if (delErr) throw new Error("Failed to clear old images: " + delErr.message);
        }
        
        // Insert or update images
        for (let i = 0; i < images.length; i++) {
          const img = images[i];
          if (img.isNew || !img.id) {
            const { error: insErr } = await supabase.from('product_images').insert({
              product_id: productId,
              image_url: img.url,
              is_primary: img.isPrimary,
              display_order: i
            });
            if (insErr) throw new Error("Failed to save image metadata: " + insErr.message);
          } else {
            const { error: updErr } = await supabase.from('product_images').update({
              is_primary: img.isPrimary,
              display_order: i
            }).eq('id', img.id);
            if (updErr) throw new Error("Failed to update image metadata: " + updErr.message);
          }
        }
        
        // Manage Variants
        const { data: existingVariants } = await supabase.from('product_variants').select('id').eq('product_id', productId);
        const existingVariantIds = existingVariants?.map(v => v.id) || [];
        const newVariantIds = variants.map(v => v.id).filter(Boolean);
        
        const variantsToDelete = existingVariantIds.filter(id => !newVariantIds.includes(id));
        if (variantsToDelete.length > 0) {
          const { error: delErr } = await supabase.from('product_variants').delete().in('id', variantsToDelete);
          if (delErr) throw new Error("Failed to delete removed variants: " + delErr.message);
        }
        
        for (const variant of variants) {
          if (variant.id) {
            const { error: vUpdErr } = await supabase.from('product_variants').update({
              sku: variant.sku || null,
              size: variant.size || null,
              color: variant.color || null,
              stock_quantity: variant.stock_quantity || 0,
              price_adjustment: variant.price_adjustment || 0,
            }).eq('id', variant.id);
            if (vUpdErr) throw new Error("Failed to update variant: " + vUpdErr.message);
          } else {
            const { error: vInsErr } = await supabase.from('product_variants').insert({
              product_id: productId,
              sku: variant.sku || null,
              size: variant.size || null,
              color: variant.color || null,
              stock_quantity: variant.stock_quantity || 0,
              price_adjustment: variant.price_adjustment || 0,
            });
            if (vInsErr) throw new Error("Failed to insert variant: " + vInsErr.message);
          }
        }
      }
      setSaveMessage({type: 'success', text: 'Product saved successfully!'});
      setTimeout(() => {
        setIsAdding(false);
        setIsEditing(false);
        setSaveMessage(null);
        fetchProducts();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setSaveMessage({type: 'error', text: err.message || "Failed to save product."});
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      await supabase.from('products').delete().eq('id', id);
      fetchProducts();
    }
  };

  const addVariantRow = () => {
    setVariants([...variants, { sku: '', size: '', color: '', stock_quantity: 0, price_adjustment: 0 }]);
  };

  const updateVariant = (index: number, field: string, value: any) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const removeVariant = (index: number) => {
    const newVariants = [...variants];
    newVariants.splice(index, 1);
    setVariants(newVariants);
  };

  if (isAdding || isEditing) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">

        <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit Product' : 'Add Product'}</h2>
        {saveMessage && (
          <div className={`p-4 mb-4 rounded-md ${saveMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {saveMessage.text}
          </div>
        )}
        <form onSubmit={handleSave} className="space-y-6 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Product Name *</label>
                <input required type="text" className="w-full border border-slate-300 p-2 rounded focus:ring-slate-900 focus:border-slate-900" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Slug (URL)</label>
                <input type="text" className="w-full border border-slate-300 p-2 rounded text-slate-500" placeholder="Auto-generated if left blank" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Price *</label>
                  <input required type="number" step="0.01" className="w-full border border-slate-300 p-2 rounded" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Original Price</label>
                  <input type="number" step="0.01" className="w-full border border-slate-300 p-2 rounded" value={formData.original_price} onChange={e => setFormData({...formData, original_price: e.target.value === '' ? 0 : parseFloat(e.target.value) || 0})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Category</label>
                  <select className="w-full border border-slate-300 p-2 rounded" value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">Brand</label>
                  <select className="w-full border border-slate-300 p-2 rounded" value={formData.brand_id} onChange={e => setFormData({...formData, brand_id: e.target.value})}>
                    <option value="">Select Brand</option>
                    {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-700">Description</label>
                <textarea className="w-full border border-slate-300 p-2 rounded" rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
            </div>

            {/* Right Column: Images and Flags */}
            <div className="space-y-6">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><ImageIcon className="w-4 h-4"/> Product Images</h3>
                
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {images.map((img, idx) => (
                    <div key={idx} className={`relative group border-2 rounded-md overflow-hidden ${img.isPrimary ? 'border-blue-500' : 'border-transparent'}`}>
                      <img src={img.url} alt={`Upload ${idx}`} className="w-full h-24 object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center gap-2">
                        {!img.isPrimary && (
                          <button type="button" onClick={() => setPrimaryImage(idx)} className="text-xs bg-white text-slate-900 px-2 py-1 rounded font-medium">Set Primary</button>
                        )}
                        <button type="button" onClick={() => removeImage(idx)} className="text-white hover:text-red-400">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      {img.isPrimary && <div className="absolute top-1 left-1 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold uppercase">Primary</div>}
                    </div>
                  ))}
                  <label className="border-2 border-dashed border-slate-300 rounded-md h-24 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors">
                    <UploadCloud className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="text-xs font-medium text-slate-500">Upload</span>
                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Star className="w-4 h-4"/> Options & Status</h3>
                
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.is_new} onChange={e => setFormData({...formData, is_new: e.target.checked})} className="rounded text-slate-900 focus:ring-slate-900" />
                    <span className="text-sm text-slate-700">New Arrival</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({...formData, is_featured: e.target.checked})} className="rounded text-slate-900 focus:ring-slate-900" />
                    <span className="text-sm text-slate-700">Featured Product</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.in_stock} onChange={e => setFormData({...formData, in_stock: e.target.checked})} className="rounded text-slate-900 focus:ring-slate-900" />
                    <span className="text-sm text-slate-700">Available / Active</span>
                  </label>
                </div>
                
                <div className="pt-2">
                  <label className="block text-sm font-medium mb-1 text-slate-700">Base Stock Quantity (if no variants)</label>
                  <input type="number" className="w-1/2 border border-slate-300 p-2 rounded" value={formData.stock_quantity} onChange={e => setFormData({...formData, stock_quantity: e.target.value === '' ? 0 : parseInt(e.target.value) || 0})} />
                </div>
              </div>
            </div>
          </div>
          
          {/* Variants Section */}
          <div className="mt-8 border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Product Variants (Sizes / Colors)</h3>
              <button type="button" onClick={addVariantRow} className="bg-slate-900 text-white px-3 py-1.5 text-sm rounded-md font-medium hover:bg-slate-800">Add Variant</button>
            </div>
            
            {variants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="p-3 font-medium text-slate-600">Size (e.g. S, 42)</th>
                      <th className="p-3 font-medium text-slate-600">Color (e.g. Black)</th>
                      <th className="p-3 font-medium text-slate-600">SKU</th>
                      <th className="p-3 font-medium text-slate-600">Stock Qty</th>
                      <th className="p-3 font-medium text-slate-600">Price Adj. (+/-)</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {variants.map((v, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="p-2"><input type="text" className="border border-slate-300 p-1.5 rounded-sm w-full" value={v.size || ''} onChange={e => updateVariant(i, 'size', e.target.value)} /></td>
                        <td className="p-2"><input type="text" className="border border-slate-300 p-1.5 rounded-sm w-full" value={v.color || ''} onChange={e => updateVariant(i, 'color', e.target.value)} /></td>
                        <td className="p-2"><input type="text" className="border border-slate-300 p-1.5 rounded-sm w-full" value={v.sku || ''} onChange={e => updateVariant(i, 'sku', e.target.value)} /></td>
                        <td className="p-2"><input type="number" className="border border-slate-300 p-1.5 rounded-sm w-24" value={v.stock_quantity || 0} onChange={e => updateVariant(i, 'stock_quantity', e.target.value === '' ? 0 : parseInt(e.target.value) || 0)} /></td>
                        <td className="p-2"><input type="number" step="0.01" className="border border-slate-300 p-1.5 rounded-sm w-24" value={v.price_adjustment || 0} onChange={e => updateVariant(i, 'price_adjustment', e.target.value === '' ? 0 : parseFloat(e.target.value) || 0)} /></td>
                        <td className="p-2 text-right">
                          <button type="button" onClick={() => removeVariant(i)} className="text-slate-400 hover:text-red-500 p-1">
                            <X className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-slate-500 text-sm bg-slate-50 p-4 rounded-md border border-slate-100">No variants added. This product will be sold as a single item using the Base Stock Quantity.</p>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-6 border-t border-slate-200">
            <button type="button" onClick={() => { setIsAdding(false); setIsEditing(false); }} className="bg-white border border-slate-300 text-slate-700 px-6 py-2 rounded-md font-medium hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={uploading} className="bg-slate-900 text-white px-8 py-2 rounded-md font-medium hover:bg-slate-800 disabled:opacity-50">
              {uploading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
        <h2 className="text-lg font-bold text-slate-900">Products ({products.length})</h2>
        <button onClick={handleAddNew} className="bg-slate-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-slate-800">Add New Product</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 font-medium">Product</th>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium">Price</th>
              <th className="px-6 py-3 font-medium">Stock</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded border border-slate-200 overflow-hidden shrink-0">
                    <img src={product.images?.[0] || 'https://images.unsplash.com/photo-1560393464-5c69a73c5770?auto=format&fit=crop&q=80&w=100'} alt={product.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">{product.name}</div>
                    <div className="text-xs text-slate-500 flex gap-2 mt-0.5">
                      {product.isNew && <span className="text-blue-600">New</span>}
                      {product.isFeatured && <span className="text-amber-600">Featured</span>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 capitalize">{product.category || 'Uncategorized'}</td>
                <td className="px-6 py-4 text-slate-900 font-medium">${Number(product.price).toFixed(2)}</td>
                <td className="px-6 py-4 text-slate-600">
                  {product.variants?.length > 0 ? (
                    <span>{product.variants.reduce((acc: number, v: any) => acc + (v.stock_quantity || 0), 0)} in {product.variants.length} vars</span>
                  ) : (
                    <span>{product.stockQuantity || 0}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  {product.inStock ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">Active</span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">Inactive</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-800 font-medium mr-4">Edit</button>
                  <button onClick={() => handleDelete(product.id)} className="text-red-500 hover:text-red-700 font-medium">Delete</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  No products found. Add your first product!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
