let sin = document.getElementById("on");
let sup = document.getElementById("off");
sin.id = 'on'
sup.addEventListener("mouseout", function () {
  sin.id= 'off'
  sup.id= 'on';
});

sin.addEventListener("mouseout", function () {
  sup.id = 'off';
  sin.id = 'on';
});


sup.addEventListener("mouseover", function () {
  sin.id= 'off'
});

sin.addEventListener("mouseover", function () {
  sup.id = 'off';
});