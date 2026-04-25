import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, ImagePlus } from 'lucide-react';
import { submitItem, type Category } from '../lib/store';

const CATEGORIES: Exclude<Category, 'All'>[] = ['Products', 'Services', 'Ideas', 'Projects', 'Tools', 'Players'];

export function SubmitForm({ onClose, onSubmitted }: { onClose: () => void; onSubmitted: () => void }) {
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState<Exclude<Category, 'All'>>('Products');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isValid = name.trim() && tagline.trim() && description.trim();

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    try {
      setSubmitting(true);
      await submitItem({
        name: name.trim(),
        tagline: tagline.trim(),
        description: description.trim(),
        link: link.trim(),
        category,
        image: image.trim(),
      });
      setSubmitted(true);
      onSubmitted();
      setTimeout(onClose, 1200);
    } catch (err) {
      console.error('Failed to submit:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E1E2D]/30 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()} className="card w-full max-w-md max-h-[85vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-[#E8ECF0]">
          <h2 className="text-sm font-extrabold text-[#1E1E2D]">Submit New Listing</h2>
          <button onClick={onClose} className="p-1 hover:bg-[#F4F5F7] rounded-lg cursor-pointer"><X className="w-4 h-4 text-[#B0B7C3]" /></button>
        </div>
        {submitted ? (
          <div className="p-10 text-center"><p className="text-3xl mb-2">🎉</p><p className="text-sm font-extrabold text-[#1E1E2D]">Submitted!</p></div>
        ) : (
          <div className="p-4 space-y-3">
            {/* Image URL */}
            <div>
              <label className="text-[10px] font-bold text-[#B0B7C3] uppercase tracking-wider mb-1.5 block">Product Image URL</label>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl bg-[#F4F5F7] border border-[#E8ECF0] flex items-center justify-center overflow-hidden flex-shrink-0">
                  {image ? (
                    <img src={image} alt="Preview" className="w-10 h-10 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <ImagePlus className="w-5 h-5 text-[#B0B7C3]" />
                  )}
                </div>
                <input type="url" value={image} onChange={e => setImage(e.target.value)} placeholder="https://example.com/logo.png" className="flex-1 px-3 py-2 text-xs" />
              </div>
            </div>

            <div><label className="text-[10px] font-bold text-[#B0B7C3] uppercase tracking-wider mb-1 block">Name *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., My App" className="w-full px-3 py-2 text-xs" /></div>
            <div><label className="text-[10px] font-bold text-[#B0B7C3] uppercase tracking-wider mb-1 block">Tagline *</label>
              <input type="text" value={tagline} onChange={e => setTagline(e.target.value)} placeholder="Short description" maxLength={80} className="w-full px-3 py-2 text-xs" /></div>
            <div><label className="text-[10px] font-bold text-[#B0B7C3] uppercase tracking-wider mb-1 block">Description *</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Tell us more..." rows={2} className="w-full px-3 py-2 text-xs" /></div>
            <div><label className="text-[10px] font-bold text-[#B0B7C3] uppercase tracking-wider mb-1 block">Link</label>
              <input type="url" value={link} onChange={e => setLink(e.target.value)} placeholder="https://..." className="w-full px-3 py-2 text-xs" /></div>
            <div><label className="text-[10px] font-bold text-[#B0B7C3] uppercase tracking-wider mb-1.5 block">Category *</label>
              <div className="flex flex-wrap gap-1.5">{CATEGORIES.map(c => (<button key={c} onClick={() => setCategory(c)} className={`cat-pill ${category === c ? 'active' : ''}`}>{c}</button>))}</div></div>
            <button onClick={handleSubmit} disabled={!isValid || submitting}
              className="w-full py-2.5 bg-[#00BFA6] text-white font-bold text-xs rounded-lg hover:bg-[#00A693] disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer">
              {submitting ? 'Submitting...' : 'Submit →'}
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
