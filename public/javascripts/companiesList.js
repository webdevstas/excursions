const deleteBtn = document.querySelectorAll('.deleteBtn')

        deleteBtn.forEach( (btn)=> {
            btn.addEventListener('click', (e) => {
                e.preventDefault()
                let result = confirm('Подтвердите удаление')
                if(result) {
                    e.target.nextSibling.value = true
                    e.target.form.submit()
                }
            })
        })