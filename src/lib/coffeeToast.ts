let coffeeToastId: string | null = null

export const showCoffeeToast = () => {
  if (typeof document === 'undefined' || typeof window === 'undefined') return
  if (coffeeToastId) return

  const container = document.createElement('div')
  container.id = 'coffee-toast'
  container.style.cssText = `
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(100px);
    z-index: 9999;
    animation: coffeeSlideUp 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;
  `

  container.innerHTML = `
    <div style="
      position: relative;
      background: linear-gradient(135deg,#1e293b,#0f172a);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 20px;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 14px;
      box-shadow: 0 16px 48px rgba(0,0,0,0.4);
      max-width: 340px;
      width: calc(100vw - 48px);
      backdrop-filter: blur(20px);
    ">
      <div style="
        width: 48px; height: 48px; flex-shrink: 0;
        display: flex; align-items: center;
        justify-content: center; font-size: 32px;
        animation: coffeeBob 1s ease-in-out infinite;
      ">
        ☕
      </div>

      <div style="
        position: absolute; left: 16px; top: 2px;
        display: flex; gap: 4px;
      ">
        <div style="
          width: 2px; height: 10px;
          background: rgba(255,255,255,0.3);
          border-radius: 2px;
          animation: steamRise 1.5s ease-in-out infinite;
        "></div>
        <div style="
          width: 2px; height: 8px;
          background: rgba(255,255,255,0.2);
          border-radius: 2px;
          animation: steamRise 1.5s ease-in-out 0.3s infinite;
        "></div>
        <div style="
          width: 2px; height: 12px;
          background: rgba(255,255,255,0.25);
          border-radius: 2px;
          animation: steamRise 1.5s ease-in-out 0.6s infinite;
        "></div>
      </div>

      <div>
        <div style="
          color: white; font-size: 14px; font-weight: 700;
          margin-bottom: 3px; letter-spacing: -0.01em;
        ">
          Server left to get a coffee ☕
        </div>
        <div style="
          color: rgba(255,255,255,0.5); font-size: 12px;
        ">
          It will come back soon...
        </div>
        <div style="
          display: flex; gap: 4px; margin-top: 8px;
        ">
          <div style="
            width: 6px; height: 6px; border-radius: 50%;
            background: #f59e0b;
            animation: dotBounce 1.2s ease-in-out infinite;
          "></div>
          <div style="
            width: 6px; height: 6px; border-radius: 50%;
            background: #f59e0b;
            animation: dotBounce 1.2s ease-in-out 0.2s infinite;
          "></div>
          <div style="
            width: 6px; height: 6px; border-radius: 50%;
            background: #f59e0b;
            animation: dotBounce 1.2s ease-in-out 0.4s infinite;
          "></div>
        </div>
      </div>

      <button onclick="this.closest('#coffee-toast')?.remove()"
        style="
          position: absolute; top: 8px; right: 8px;
          background: none; border: none;
          color: rgba(255,255,255,0.4); cursor: pointer;
          font-size: 14px; width: 24px; height: 24px;
          display: flex; align-items: center;
          justifyContent: center; border-radius: 6px;
        "
      >✕</button>
    </div>
  `

  const closeEl = container.querySelector('button')
  if (closeEl) {
    closeEl.addEventListener('click', () => {
      container.remove()
      coffeeToastId = null
    })
  }

  document.body.appendChild(container)
  coffeeToastId = 'coffee-toast'

  window.setTimeout(() => {
    const el = document.getElementById('coffee-toast')
    if (el) {
      el.style.animation =
        'coffeeSlideDown 0.3s ease-in forwards'
      window.setTimeout(() => { el.remove(); coffeeToastId = null }, 300)
    } else {
      coffeeToastId = null
    }
  }, 6000)
}
