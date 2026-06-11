import { useState, useContext } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2, Plus } from 'lucide-react';
import { AppContext } from '../context/AppContext';

export default function Gallery() {
  const { gallery } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);

  const categories = ['All', 'Worship', 'Community', 'Outreach', 'Youth'];

  const dbGalleryItems = gallery.map(item => ({
    id: `db-${item.id}`,
    title: item.title,
    category: item.category,
    image: item.url,
    description: `A media asset from our ${item.category} ministry - ${item.title}.`
  }));

  const staticGalleryItems = [
    {
      id: 9,
      title: 'Christmas Cake Cutting',
      category: 'Community',
      image: '/christmas_stage_cake.jpg',
      description: 'Rev. C. Jonathan Edward, Co-Pastor Nirmala Jonathan, and church members celebrate Christmas together on stage with a cake cutting ceremony.'
    },
    {
      id: 10,
      title: 'Christmas Celebration Message',
      category: 'Worship',
      image: '/christmas_gold_vest_speaker.jpg',
      description: 'Ministers share glad tidings and Christmas covenant blessings at the Masjid Banda Community Hall.'
    },
    {
      id: 11,
      title: 'Expository Preaching',
      category: 'Worship',
      image: '/rev_jonathan_preaching_1.jpg',
      description: 'Rev. C. Jonathan Edward delivering a powerful sermon on living as a doer of the Word.'
    },
    {
      id: 12,
      title: 'Word Exposition',
      category: 'Worship',
      image: '/rev_jonathan_preaching_2.jpg',
      description: 'Congregation receiving the Word of God with joy, faith, and spiritual focus during Sunday service.'
    },
    {
      id: 0,
      title: 'Resurrection Praise Night',
      category: 'Worship',
      gradient: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
      symbol: '⛪',
      description: 'Congregants lift their hands in deep adoration during our annual Resurrection Night.'
    },
    {
      id: 1,
      title: 'Family Covenant picnic',
      category: 'Community',
      gradient: 'linear-gradient(135deg, #134e5e, #71b280)',
      symbol: '🌳',
      description: 'A day of communion, fellowship, and joy among our church families in the park.'
    },
    {
      id: 2,
      title: 'Feeding Hope Project',
      category: 'Outreach',
      gradient: 'linear-gradient(135deg, #8a2387, #e94057, #f27121)',
      symbol: '🤝',
      description: 'Distributing warm meals and Bibles to shelter homes during our weekly street outreach.'
    },
    {
      id: 3,
      title: 'Youth Fire Retreat 2026',
      category: 'Youth',
      gradient: 'linear-gradient(135deg, #f12711, #f5af19)',
      symbol: '🔥',
      description: 'Youth campers gathered around the campfire to share praise reports and testimonies.'
    },
    {
      id: 4,
      title: 'Sacred Communion Service',
      category: 'Worship',
      gradient: 'linear-gradient(135deg, #403b4a, #e7e9bb)',
      symbol: '🍷',
      description: 'Partaking of the bread and the cup in solemn memory of Christ’s sacrifice.'
    },
    {
      id: 5,
      title: 'Bible Study circles',
      category: 'Community',
      gradient: 'linear-gradient(135deg, #1e3c72, #2a5298)',
      symbol: '📖',
      description: 'Believers meeting in small groups for deeper discipleship and fellowship.'
    },
    {
      id: 6,
      title: 'Youth Worship Band Practice',
      category: 'Youth',
      gradient: 'linear-gradient(135deg, #00c6ff, #0072ff)',
      symbol: '🎸',
      description: 'Our youth band rehearsing new covenant songs for the upcoming Friday gathering.'
    },
    {
      id: 7,
      title: 'Urban Medical Mission',
      category: 'Outreach',
      gradient: 'linear-gradient(135deg, #11998e, #38ef7d)',
      symbol: '🩺',
      description: 'Providing free health consults and prayer support to underserved families.'
    },
    {
      id: 8,
      title: 'Pentecost Prayer Vigil',
      category: 'Worship',
      gradient: 'linear-gradient(135deg, #cc2b5e, #753a88)',
      symbol: '🕯️',
      description: 'An overnight prayer shield seeking the baptism and empowerment of the Holy Spirit.'
    }
  ];

  const galleryItems = [...dbGalleryItems, ...staticGalleryItems];

  const filteredItems = galleryItems.filter((item) => {
    if (activeTab === 'All') return true;
    return item.category === activeTab;
  });

  const visibleItems = filteredItems.slice(0, visibleCount);

  const handleLoadMore = () => {
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + 3, filteredItems.length));
      setLoadingMore(false);
    }, 800);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev === 0 ? filteredItems.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setLightboxIndex((prev) => (prev === filteredItems.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="gallery-page section-padding">
      <div className="gallery-container">
        
        <div className="gallery-header">
          <span className="section-subtitle">VISUAL FELLOWSHIP</span>
          <h2 className="section-title">Media Sanctuary & Gallery</h2>
          <div className="header-divider"></div>
          <p className="gallery-intro">
            Experience our community moments, worship nights, outreach activities, and youth 
            gatherings captured in pictures.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="gallery-filter-bar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveTab(cat);
                setVisibleCount(6); // Reset count on filter change
              }}
              className={`filter-tab-btn ${activeTab === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Masonry Grid */}
        <div className="gallery-masonry-grid">
          {visibleItems.map((item) => (
            <div 
              key={item.id} 
              className="gallery-card glass-panel"
              onClick={() => {
                const filteredIdx = filteredItems.findIndex(fi => fi.id === item.id);
                setLightboxIndex(filteredIdx !== -1 ? filteredIdx : 0);
              }}
            >
              <div 
                className="gallery-media-placeholder" 
                style={item.image ? {} : { background: item.gradient }}
              >
                {item.image ? (
                  <img src={item.image} alt={item.title} className="gallery-card-image" />
                ) : (
                  <span className="gallery-media-symbol">{item.symbol}</span>
                )}
                <div className="media-overlay-actions">
                  <Maximize2 size={24} className="hover-action-icon" />
                </div>
              </div>
              <div className="gallery-card-info">
                <span className="card-category-tag">{item.category}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {visibleCount < filteredItems.length && (
          <div className="load-more-wrapper">
            <button 
              onClick={handleLoadMore} 
              className="btn-secondary load-more-btn"
              disabled={loadingMore}
            >
              {loadingMore ? (
                <span className="loading-spinner"></span>
              ) : (
                <>
                  <Plus size={16} />
                  <span>Load More Media</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Lightbox Modal Overlay */}
        {lightboxIndex !== null && (
          <div className="lightbox-overlay" onClick={() => setLightboxIndex(null)}>
            <button className="lightbox-close" onClick={() => setLightboxIndex(null)}>
              <X size={24} />
            </button>

            <button className="lightbox-nav-btn prev" onClick={handlePrev}>
              <ChevronLeft size={36} />
            </button>

            <div className="lightbox-content-box" onClick={(e) => e.stopPropagation()}>
              <div 
                className="lightbox-view-media"
                style={filteredItems[lightboxIndex]?.image ? {} : { background: filteredItems[lightboxIndex]?.gradient }}
              >
                {filteredItems[lightboxIndex]?.image ? (
                  <img src={filteredItems[lightboxIndex]?.image} alt={filteredItems[lightboxIndex]?.title} className="lightbox-view-image" />
                ) : (
                  <span className="lightbox-media-symbol">
                    {filteredItems[lightboxIndex]?.symbol}
                  </span>
                )}
              </div>
              <div className="lightbox-details">
                <span className="lightbox-category">{filteredItems[lightboxIndex]?.category}</span>
                <h3>{filteredItems[lightboxIndex]?.title}</h3>
                <p>{filteredItems[lightboxIndex]?.description}</p>
              </div>
            </div>

            <button className="lightbox-nav-btn next" onClick={handleNext}>
              <ChevronRight size={36} />
            </button>
          </div>
        )}

      </div>

      <style>{`
        .gallery-page {
          background-color: var(--bg-dark);
          position: relative;
          z-index: 5;
        }

        .gallery-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .gallery-header {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 40px;
        }

        .gallery-intro {
          max-width: 650px;
          margin-top: 20px;
          font-size: 16px;
          color: var(--text-secondary);
        }

        .gallery-filter-bar {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 50px;
          flex-wrap: wrap;
        }

        /* Grid */
        .gallery-masonry-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 30px;
        }

        @media (max-width: 992px) {
          .gallery-masonry-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .gallery-masonry-grid {
            grid-template-columns: 1fr;
            padding: 0 10px;
          }
        }

        .gallery-card {
          overflow: hidden;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          text-align: left;
          height: 100%;
          transition: transform 0.4s ease, border-color 0.3s ease;
        }

        .gallery-card:hover {
          transform: translateY(-6px);
          border-color: var(--border-glow);
        }

        .gallery-media-placeholder {
          height: 240px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          transition: filter 0.3s ease;
          border-bottom: 1px solid var(--border-glass);
          background-color: #030304;
        }

        .gallery-card-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }

        .gallery-card:hover .gallery-card-image {
          transform: scale(1.04);
        }

        .gallery-media-symbol {
          font-size: 54px;
          filter: drop-shadow(0 4px 10px rgba(0,0,0,0.3));
          transition: transform 0.4s ease;
        }

        .gallery-card:hover .gallery-media-symbol {
          transform: scale(1.15) rotate(5deg);
        }

        .media-overlay-actions {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .gallery-card:hover .media-overlay-actions {
          opacity: 1;
        }

        .hover-action-icon {
          color: #FFF;
          filter: drop-shadow(0 0 8px var(--accent-cyan));
        }

        .gallery-card-info {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .card-category-tag {
          font-family: var(--font-heading);
          font-size: 10px;
          font-weight: 700;
          color: var(--accent-cyan);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .gallery-card-info h3 {
          font-size: 18px;
          color: #FFF;
        }

        .gallery-card-info p {
          font-size: 13px;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        /* Load More styling */
        .load-more-wrapper {
          margin-top: 50px;
          display: flex;
          justify-content: center;
        }

        .load-more-btn {
          font-size: 14px;
          padding: 12px 30px;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-top-color: var(--accent-cyan);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Lightbox styling */
        .lightbox-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: rgba(3, 3, 5, 0.95);
          backdrop-filter: blur(10px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lightbox-close {
          position: absolute;
          top: 30px;
          right: 30px;
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          transition: color 0.3s ease;
        }

        .lightbox-close:hover {
          color: #FFF;
        }

        .lightbox-nav-btn {
          position: absolute;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 20px;
          transition: color 0.3s ease;
        }

        .lightbox-nav-btn:hover {
          color: #FFF;
        }

        .lightbox-nav-btn.prev { left: 40px; }
        .lightbox-nav-btn.next { right: 40px; }

        @media (max-width: 768px) {
          .lightbox-nav-btn.prev { left: 10px; }
          .lightbox-nav-btn.next { right: 10px; }
        }

        .lightbox-content-box {
          max-width: 600px;
          width: 90%;
          background: var(--bg-card);
          border: 1px solid var(--border-glass);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 30px 60px rgba(0,0,0,0.8);
          animation: modalAppear 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .lightbox-view-media {
          height: 380px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid var(--border-glass);
          background-color: #030304;
        }

        .lightbox-view-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .lightbox-media-symbol {
          font-size: 80px;
          filter: drop-shadow(0 10px 20px rgba(0,0,0,0.4));
        }

        .lightbox-details {
          padding: 24px 30px;
          text-align: left;
        }

        .lightbox-category {
          font-family: var(--font-heading);
          font-size: 11px;
          font-weight: 700;
          color: var(--accent-cyan);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .lightbox-details h3 {
          font-size: 22px;
          color: #FFF;
          margin: 6px 0 10px;
        }

        .lightbox-details p {
          font-size: 14px;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        @keyframes modalAppear {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
