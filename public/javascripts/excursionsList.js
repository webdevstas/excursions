const filterSelect = document.querySelectorAll('.filter-select'),
    excursionsNode = document.querySelector('.excursions')
let deleteBtn = document.querySelectorAll('.deleteBtn')

filterSelect.forEach(item => {
    item.addEventListener('change', async () => {
        render(await getExcursions(buildQuery(filterSelect)))
    })
})

async function getExcursions(query) {
    let response = await fetch(query)
    let items = response.json()
    return items
}

function buildQuery(nodeList) {
    let query = '/excursions-list/filter?'
    nodeList.forEach(el => {
        query += `${el.name}=${el.value}&`
    })
    return query
}

function render(list) {
    excursionsNode.innerHTML = ''
    let head = `
    <div class="excursions__col">
        <h2 class="excursions__col-title">Название</h2>
    </div>
    <div class="excursions__col">
        <h2 class="excursions__col-title">Оператор
    </div>
    <div class="excursions__col status">
        <h2 class="excursions__col-title">Статус</h2>
    </div>
    <div class="excursions__col">
        <h2 class="excursions__col-title">Редактирование</h2>
    </div>
    `
    excursionsNode.insertAdjacentHTML('beforeend', head)
    list.forEach(item => {
        let badgeApproved = item.isApproved ? `<div class="badge bg-success">Одобрено</div>` : `<div class="badge bg-danger">Не одобрено</div>`
        let badgePublished = item.isPublished ? `<div class="badge bg-info text-dark">Опубликовано</div>` : `<div class="badge bg-danger">Не опубликовано</div>`
        let element = `
                <div class="excursions__col">
                    <span class="excursions__title">${item.title}</span>
                </div>
                <div class="excursions__col">
                    <span class="excursions__company">${item.company}</span>
                </div>
                <div class="excursions__col status">
                    <div class="badge-block">
                        ${badgeApproved}
                        ${badgePublished}
                    </div>
                </div>
                <div class="excursions__col">
                    <a href="/excursions-list/${item.slug}">
                        <button class="btn btn-light">Редактировать</button>
                    </a>
                    <form action="/excursions-list/${item.slug}/delete" method="post">
                        <button class="deleteBtn btn btn-light">Удалить</button>
                    </form>
                </div>
                    `
        excursionsNode.insertAdjacentHTML('beforeend', element)
    })

    deleteBtn = document.querySelectorAll('.deleteBtn')

    deleteBtn.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault()
            let result = confirm('Подтвердите удаление')
            if (result) {
                e.target.form.submit()
            }
        })
    })
}

const searchInp = document.querySelector('#search'),
    promise = new Promise((resolve, reject) => {
        resolve(getExcursions('/excursions-list/filter'))
    })

let filtered = []

promise.then((items) => {
    searchInp.addEventListener('input', () => {
        items.forEach(item => {
            if (item.title.toLowerCase().startsWith(searchInp.value.toLowerCase())) {
                filtered.push(item)
            }
            render(filtered)
        })
        filtered = []
    })
})


