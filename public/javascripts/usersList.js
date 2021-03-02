const deletBtns = document.querySelectorAll('.delete-btn'),
    usersNode = document.querySelector('.users-block')


deletBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
        e.preventDefault()

        let userEmail = btn.previousSibling.innerText
        let confirmDelete = confirm(`Подтвердите удаление пользователя: ${userEmail}`)

        if (confirmDelete) {
            let response = await fetch('', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({
                    action: 'delete',
                    user: userEmail
                })
            })
            let result = await response.json()

            let messageNode = document.createElement('div')
            messageNode.innerText = result.msg

            if (result.success) {
                if (!document.querySelector('.success')) {
                    messageNode.classList.add('success')
                    usersNode.prepend(messageNode)
                    btn.parentNode.style.display = 'none'
                }
            }
            else {
                if (!document.querySelector('.error')) {
                    messageNode.classList.add('error')
                    usersNode.prepend(messageNode)
                }
            }

        }
    })
})