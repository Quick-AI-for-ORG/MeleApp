const a = document.querySelectorAll('.product-card a');
for (let i = 0; i < a.length; i++) {
  a[i].addEventListener('click', function() {
    const id = this.id;
    let form = document.querySelector(`#form-${id}`);
    form.submit();
  });
}