const passInp = document.querySelector('input[name="pass"]'),
    confirmPassInp = document.querySelector('input[name="confirmPass"]'),
    form = document.querySelector('.user-register__form')

form.addEventListener('submit', e => {
    e.preventDefault()

    if (passInp.value === confirmPassInp.value) {
        form.submit()
    } else {
        if (!document.querySelector('.error')) {
            let errNode = document.createElement('div')
            errNode.classList.add('error')
            errNode.innerText = 'Пароли не совпадают'
            form.append(errNode)
        }
    }
})
