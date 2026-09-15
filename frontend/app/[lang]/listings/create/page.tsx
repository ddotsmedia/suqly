'use client';

import { useState } from 'react';

export default function CreateListingPage({ params }: { params: { lang: string } }) {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    emirate: '',
    price: '',
    description: '',
    community: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:3001/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
        }),
      });

      if (response.ok) {
        alert('Listing created successfully!');
        // Redirect to listings page
      } else {
        alert('Error creating listing');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error creating listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-12 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Create New Listing</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="input-field"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Select Category</option>
              <option value="goods">Goods</option>
              <option value="property">Property</option>
              <option value="motors">Motors</option>
              <option value="jobs">Jobs</option>
              <option value="services">Services</option>
              <option value="businesses">Businesses</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Emirate</label>
            <select
              name="emirate"
              value={formData.emirate}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Select Emirate</option>
              <option value="dubai">Dubai</option>
              <option value="abudhabi">Abu Dhabi</option>
              <option value="sharjah">Sharjah</option>
              <option value="ajman">Ajman</option>
              <option value="umm_al_quwain">Umm Al Quwain</option>
              <option value="ras_al_khaimah">Ras Al Khaimah</option>
              <option value="fujairah">Fujairah</option>
              <option value="al_ain">Al Ain</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Price (AED)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Community</label>
            <input
              type="text"
              name="community"
              value={formData.community}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input-field min-h-32"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? 'Creating...' : 'Create Listing'}
        </button>
      </form>
    </div>
  );
}
