/* Let the headline/CTA paint before importing WebGL. No media gates the page. */
(() => {
  const stage=document.querySelector('#stage');
  const poster=document.querySelector('#fallback');
  let started=false;
  function showFallback(error){stage.dataset.loadState='fallback';document.querySelector('#scene').hidden=true;poster.hidden=false;poster.removeAttribute('aria-hidden');poster.classList.remove('hero-poster-ready');poster.querySelector('source')?.remove();poster.querySelector('img').src='assets/hero-white-fallback.webp?v=glass5';console.warn('[revia-hero] Using static composition',error);}
  function start(){
    if(started)return;started=true;stage.dataset.loadState='loading';
    // Start the model alongside module downloads instead of after their parsing/setup.
    const model=document.createElement('link');model.rel='preload';model.as='fetch';model.crossOrigin='anonymous';model.href='assets/flower-smooth-satin.glb';document.head.append(model);
    import('./hero-glb.js?v=gsap2').catch(showFallback);
  }
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){io.disconnect();start();}},{rootMargin:'180px'});io.observe(stage);}else start();
  }));
  // Stop invisible decorative animations below the fold. Their original styles stay intact.
  if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{e.target.classList.toggle('decoration-visible',e.isIntersecting);
    // Section 03 demo: its scan → link → photo layers are separate CSS animations; align them to t=0 each time the
    // visual comes into view so the 9 s story always starts with the scan and the layers never drift apart.
    const demo=e.target.querySelector('.demo-scene');if(demo&&e.isIntersecting&&demo.getAnimations)demo.getAnimations({subtree:true}).forEach(a=>{a.currentTime=0;});
  }),{rootMargin:'100px'});document.querySelectorAll('.f-visual,.portal').forEach(el=>io.observe(el));}
})();
