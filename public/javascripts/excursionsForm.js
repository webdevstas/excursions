const inputs = document.querySelectorAll('input')
const textAreas = document.querySelectorAll('textarea')
const points = document.querySelector('.error-points').innerText
const cancelBtn = document.querySelectorAll('.cancelBtn')
const deleteImgBtns = document.querySelectorAll('.delete-img')
const tagCheckboxes = document.querySelectorAll('input[name="tags"]')
const tags = document.querySelector('#tags').innerText
const action = document.querySelector('.register-form').action


tagCheckboxes.forEach(item => {
    if (tags.includes(item.value)) {
        item.checked = true
    }
})

textAreas.forEach((item) => {
    if (points.includes(item.name)) {
        item.classList.add('error')
    }
})

inputs.forEach((input) => {
    if (points.includes(input.name)) {
        input.classList.add('error')
    }
})

cancelBtn.forEach((btn) => {
    btn.addEventListener('click', () => {
        window.location.replace('/excursions-list')
    })
})

deleteImgBtns.forEach((btn, i) => {
    let index = i
    btn.addEventListener('click', (e) => {
        let xhr = new XMLHttpRequest()
        if (index > 0) {
            index -= 1
        }
        let json = JSON.stringify({
            action: 'deleteImg',
            index: index
        })


        xhr.open('DELETE', action, true)
        xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')

        xhr.send(json)

        xhr.responseType = 'json'

        xhr.onload = function () {
            let responseObj = xhr.response
            if (responseObj.success) {
                btn.parentNode.style.display = 'none'
            } else {
                console.error(responseObj.error)
            }
        }
    })
})

/**
 * Переключение вкладок
 */
const mainTab = document.querySelector('#main-tab'),
    ticketsTab = document.querySelector('#tickets-tab'),
    mainPane = document.querySelector('#main'),
    ticketsPane = document.querySelector('#tickets'),
    allTabs = document.querySelectorAll('.tab')

allTabs.forEach(function (tab) {
    tab.addEventListener('click', e => {
        changeTabContent(tab)
    })
})

function changeTabContent(el) {
    let aria = el.getAttribute('aria-controls')
    let pane = document.querySelector(`#${aria}`)
    let otherPane = pane.nextElementSibling.classList.contains('tab-pane') ? pane.nextElementSibling : pane.previousElementSibling

    allTabs.forEach(tab => {
        tab.classList.remove('active')
    })

    el.classList.add('active')

    otherPane.classList.remove('visible')
    pane.classList.add('visible')
}

/**
 *  Добавление билета
 */
const addBtn = document.querySelector('#add-ticket'),
    titleInp = document.querySelector('input[name="ticket-title"]'),
    descriptionInp = document.querySelector('textarea[name="ticket-description"]'),
    priceInp = document.querySelector('input[name="ticket-price"]'),
    ticketsArr = [],
    ticketsListEl = document.querySelector('#tickets-list'),
    ticketsInput = document.querySelector('#tickets-input')
let ticketsString = ''

addBtn.addEventListener('click', (e) => {
    e.preventDefault()

    let ticket = {
        title: titleInp.value,
        description: descriptionInp.value,
        price: priceInp.value
    }
    ticketsArr.push(ticket)
    ticketsString = JSON.stringify(ticketsArr)

    let addEl = new Promise((resolve, reject) => {
        ticketsListEl.innerHTML += `<li class=tickets-list__item><span>${ticket.title}</span><span>${ticket.price} руб.</span><button class="btn btn-light delete-ticket">Удалить</button></li>`
        resolve()
    })

    addEl.then(() => {
        const deleteTicketBtn = document.querySelectorAll('.delete-ticket')
        deleteTicketBtn.forEach(btn => {
            btn.addEventListener('click', e => {
                e.preventDefault()
                ticketsArr.pop()
                btn.parentNode.style.display = 'none'
            })
        })
    })
    ticketsInput.value = ticketsString
})

/**
 * Удаление билета
 */
const deleteTicketBtn = document.querySelectorAll('.delete-ticket')
deleteTicketBtn.forEach(btn => {
    btn.addEventListener('click', e => {
        e.preventDefault()
        if (btn.dataset.ticketId) {
            let xhr = new XMLHttpRequest()
            let json = JSON.stringify({
                action: 'deleteTicket',
                id: btn.dataset.ticketId
            })
            xhr.open('DELETE', action, true)
            xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')

            xhr.send(json)

            xhr.responseType = 'json'

            xhr.onload = function () {
                let responseObj = xhr.response
                if (responseObj.success) {
                    btn.parentNode.style.display = 'none'
                } else {
                    console.error(responseObj.error)
                }
            }
        }
    })
})
