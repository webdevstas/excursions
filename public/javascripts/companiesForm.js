
const inputs = document.querySelectorAll('input')
let points = document.querySelector('.error-points').innerText
const cancelBtn = document.querySelectorAll('.cancelBtn')

inputs.forEach((input) => {
    if (points.includes(input.name)) {
        input.classList.add('error')
    }
})

cancelBtn.forEach( (btn) => {
    btn.addEventListener('click', () => {
        window.location.replace('/companies-list')
    })
})