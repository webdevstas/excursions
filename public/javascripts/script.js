const sideMenu = document.querySelector('menu')
const openBtn = document.querySelector('#open-menu')
const shadowBg = document.querySelector('#shadow-bg')


window.onload = function () {

    /**
     * Выделяем текущую страницу в меню
     */
    const menuItems = document.querySelectorAll('.menu-item')
    const title = document.querySelector('h1').innerText

    makeItemSelected(menuItems, title)

    function makeItemSelected(itemsArr, name) {
        itemsArr.forEach(item => {
            if (name === item.innerText) {
                item.classList.add('menu-item_active')
            }
        })
    }
    /**
     * Оперируем классами меню
     */
    if (document.documentElement.clientWidth < 993) {
        sideMenu.classList.add('side')
    }

    window.addEventListener('resize', function () {
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
    /**
     * Анимируем кнопку меню
     */
    openBtn.addEventListener('click', function () {
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
    /**
     * Анимируем подложку контента
     */
    shadowBg.addEventListener('click', function () {
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

    /**
     * Функционал подсветки соседнего с input lable для форм
     */
    const inputBlocks = document.querySelectorAll('.input-block')

    inputBlocks.forEach(item => {
        let input = item.lastChild
        let label = item.firstChild

        input.addEventListener('focusin', e => {
            label.classList.add('focused')
        })

        input.addEventListener('focusout', e => {
            label.classList.remove('focused')
        })
    })


}



