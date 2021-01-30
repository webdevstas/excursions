const sideMenu = document.querySelector('menu')
const openBtn = document.querySelector('#open-menu')
const shadowBg = document.querySelector('#shadow-bg')

window.onload = function() {
    if(document.documentElement.clientWidth < 993) {
        sideMenu.classList.add('side')
    }

    window.addEventListener('resize',function () {
        if (document.documentElement.clientWidth < 993) {
            sideMenu.classList.add('side')
        }
        else {
            sideMenu.classList.remove('side')
            gsap.to([sideMenu, openBtn], {
                x: 0
            })
        }
    })
    
    openBtn.addEventListener('click', function() {
        gsap.to(openBtn, {
            x: 1000,
            duration: 1
        })
        gsap.to(sideMenu, {
            x: 500,
            delay: 0.5
            
        })
        gsap.to(shadowBg, {
            display: 'block',
            x: 1000,
            delay: 0.2
        })
    })

    shadowBg.addEventListener('click', function() {
        gsap.to(openBtn, {
            x: 0,
            duration: 1
        })
        gsap.to(sideMenu, {
            x: 0
        })
        gsap.to(shadowBg, {
            display: 'none',
            x: 0
        })
    })
}



