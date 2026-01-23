import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Camera, Send, MessageCircle, Twitter, Upload, CheckCircle, Loader2 } from 'lucide-react';
import { MEMES, TESTIMONIALS, LINKS } from '../constants';

const Community: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { amount: 0.2 });
  const [formState, setFormState] = useState<'idle' | 'loading' | 'success'>('idle');

  // Confetti Logic
  useEffect(() => {
    if (!isInView || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles: Particle[] = [];
    const colors = ['#F3BA2F', '#FFFFFF', '#9945FF'];

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      rotation: number;
      rotationSpeed: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = -Math.random() * canvas.height;
        this.size = Math.random() * 8 + 4;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 3 + 2;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.rotation = Math.random() * 360;
        this.rotationSpeed = Math.random() * 4 - 2;
      }

      update(mouseX: number, mouseY: number) {
        this.y += this.speedY;
        this.x += this.speedX;
        this.rotation += this.rotationSpeed;

        // Mouse interaction
        const dx = this.x - mouseX;
        const dy = this.y - mouseY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (150 - distance) / 150;
          const directionX = forceDirectionX * force * 5;
          const directionY = forceDirectionY * force * 5;

          this.x += directionX;
          this.y += directionY;
        }

        if (this.y > canvas.height) {
          this.y = -10;
          this.x = Math.random() * canvas.width;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
      }
    }

    // Initialize particles
    for (let i = 0; i < 70; i++) {
      particles.push(new Particle());
    }

    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };
    window.addEventListener('mousemove', handleMouseMove);

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update(mouseX, mouseY);
        p.draw();
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [isInView]);

  const handleShare = (platform: string, text?: string) => {
    const url = encodeURIComponent(window.location.href);
    const textContent = encodeURIComponent(text || "Check out $BANA! The premium meme asset on Solana. 🍌🚀");
    let shareUrl = '';
    if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?text=${textContent}&url=${url}`;
    } else if (platform === 'telegram') {
      shareUrl = `https://t.me/share/url?url=${url}&text=${textContent}`;
    }
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const handleMemeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('loading');
    // Simulate API call
    setTimeout(() => {
      setFormState('success');
      // Reset after 3 seconds
      setTimeout(() => setFormState('idle'), 3000);
    }, 1500);
  };

  return (
    <section id="community" ref={containerRef} className="py-24 bg-black relative overflow-hidden">
      {/* Interactive Canvas Background */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 z-0 pointer-events-none opacity-40"
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="font-display text-5xl md:text-7xl text-white mb-6">
            THE <span className="text-bana-yellow">JUNGLE</span>
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Where the apes hang out. Check out the latest community creations and join the vibe.
          </p>
          
          {/* Section Share Buttons */}
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => handleShare('twitter')}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-[#1DA1F2] hover:text-white hover:scale-105 transition-all text-sm font-bold text-gray-300 border border-white/5"
            >
              <Twitter size={18} /> Share Page
            </button>
            <button 
              onClick={() => handleShare('telegram')}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 hover:bg-[#0088cc] hover:text-white hover:scale-105 transition-all text-sm font-bold text-gray-300 border border-white/5"
            >
              <Send size={18} /> Share Page
            </button>
          </div>
        </div>

        {/* Meme Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-20">
          {MEMES.map((meme, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group relative overflow-hidden rounded-2xl aspect-square border border-white/10 hover:border-bana-yellow/50 transition-all cursor-pointer bg-black"
            >
              <img src={meme} alt="Community Meme" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-90 group-hover:opacity-100" />
              
              {/* Overlay with Share Actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 backdrop-blur-sm">
                <span className="text-white font-bold text-lg mb-2">Share Meme</span>
                <div className="flex gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleShare('twitter', "Look at this gem from the $BANA community! 😂"); }}
                    className="p-3 bg-white text-black rounded-full hover:bg-bana-yellow hover:scale-110 transition-all"
                    title="Share on X"
                  >
                    <Twitter size={20} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleShare('telegram', "Found this gem in the $BANA community!"); }}
                    className="p-3 bg-white text-black rounded-full hover:bg-bana-yellow hover:scale-110 transition-all"
                    title="Share on Telegram"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/5">
              <div className="flex items-center gap-2 mb-4 text-bana-yellow font-bold">
                 <Twitter size={16} /> {t.user}
              </div>
              <p className="text-gray-300 italic">"{t.text}"</p>
            </div>
          ))}
        </div>

        {/* Meme Submission Form */}
        <div className="max-w-2xl mx-auto bg-gradient-to-b from-white/10 to-transparent border border-white/10 rounded-3xl p-8 mb-12">
           <h3 className="font-display text-3xl text-center mb-6 text-white">SUBMIT YOUR <span className="text-bana-yellow">MEME</span></h3>
           
           {formState === 'success' ? (
             <div className="text-center py-12">
               <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                 <CheckCircle size={40} className="text-white" />
               </motion.div>
               <h4 className="text-2xl font-bold text-white mb-2">Meme Submitted!</h4>
               <p className="text-gray-400">Our apes will review it shortly.</p>
             </div>
           ) : (
             <form onSubmit={handleMemeSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 ml-1">Creator Name</label>
                  <input type="text" required placeholder="@username" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-bana-yellow outline-none transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-400 ml-1">Email (Optional)</label>
                  <input type="email" placeholder="you@example.com" className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-bana-yellow outline-none transition-colors" />
                </div>
              </div>
              
              <div className="space-y-2">
                 <label className="text-sm font-bold text-gray-400 ml-1">Upload Meme</label>
                 <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-bana-yellow/50 transition-colors cursor-pointer group">
                   <Upload size={32} className="mx-auto mb-3 text-gray-500 group-hover:text-bana-yellow transition-colors" />
                   <p className="text-gray-400 text-sm">Drag & drop or click to upload</p>
                 </div>
              </div>

              <button 
                disabled={formState === 'loading'}
                className="w-full bg-bana-yellow text-bana-dark font-bold text-lg py-4 rounded-xl hover:bg-white transition-all transform active:scale-95 flex items-center justify-center gap-2"
              >
                {formState === 'loading' ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                {formState === 'loading' ? 'Sending...' : 'Submit to Jungle'}
              </button>
             </form>
           )}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
            <p className="text-gray-500 text-sm mb-4">Or join the community directly</p>
            <div className="flex justify-center gap-4">
               <a href={LINKS.TELEGRAM} target="_blank" className="text-white hover:text-bana-yellow transition-colors"><Send size={24} /></a>
               <a href={LINKS.TWITTER} target="_blank" className="text-white hover:text-bana-yellow transition-colors"><Twitter size={24} /></a>
            </div>
        </div>
      </div>
    </section>
  );
};

export default Community;