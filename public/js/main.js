const overlay = document.querySelector('.overlay');
const tabs = document.querySelectorAll('.services__tab__item')
const panes = document.querySelectorAll('.service__tab-pane')
const line = document.querySelector('.services__tabs__line')
const tabActive = document.querySelector('.services__tab__item.active')
const teamMores = document.querySelectorAll('.team__more')
const teamTabs = document.querySelectorAll('.team__more__tab')
const teamTabCloses = document.querySelectorAll('.team__more__tab__close')
const ourProductsMores = document.querySelectorAll('.ourproducts__more')

function closeNotification() {
    overlay.classList.add('fade-out');
    overlay.classList.remove('fade-in');
    document.querySelector('body').classList.remove('noscroll');
    document.querySelector('.notification').classList.add('fade-out');
    document.querySelector('.notification').classList.remove('fade-in');
}
  
function openNotification(text) {
    overlay.classList.add('fade-in');
    overlay.classList.remove('fade-out');
    document.querySelector('body').classList.add('noscroll');
    document.querySelector('.notification').classList.add('fade-in');
    document.querySelector('.notification').classList.remove('fade-out');
    document.querySelector('.notification-text').innerHTML = text;
}


// banner
document.querySelector('.banner__more').onclick = function () {    
    overlay.classList.remove('fade-out')
    overlay.classList.add('fade-in')
    document.querySelector('body').classList.add('noscroll')
    document.querySelector('.banner__more__tab').classList.remove('fade-out')
    document.querySelector('.banner__more__tab').classList.add('fade-in')
}
  
overlay.onclick = function () {
    overlay.classList.add('fade-out')
    overlay.classList.remove('fade-in')
    document.querySelector('body').classList.remove('noscroll')
    document.querySelector('.banner__more__tab').classList.add('fade-out')
    document.querySelector('.banner__more__tab').classList.remove('fade-in')
    document.querySelector('.team__more__tab.fade-in').classList.add('fade-out')
    document.querySelector('.team__more__tab.fade-in').classList.remove('fade-in')
}

document.querySelector('.banner__more__tab__close').onclick = function () {
    overlay.classList.add('fade-out')
    overlay.classList.remove('fade-in')
    document.querySelector('body').classList.remove('noscroll')
    document.querySelector('.banner__more__tab').classList.add('fade-out')
    document.querySelector('.banner__more__tab').classList.remove('fade-in')
}

// services

line.style.left = tabActive.offsetLeft + 'px'
line.style.width = tabActive.offsetWidth + 'px'
tabs.forEach((tab, index) => {
    const pane = panes[index]

    tab.onclick = function () {
        document.querySelector('.services__tab__item.active').classList.remove('active')
        document.querySelector('.service__tab-pane.active').classList.remove('active')
        line.style.left = this.offsetLeft + 'px'
        line.style.width = this.offsetWidth + 'px'
        this.classList.add('active')
        pane.classList.add('active')
        pane.classList.add('fade-in')
    }
})

$(document).ready(function() {
    $('.projects__list').slick({
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        // centerMode: true,
        autoplay: true,
        autoplaySpeed: 2000,
        nextArrow: $('.projects__btn-next'),
        prevArrow: $('.projects__btn-prev'),
        dots: true,
    });
});

// reviews
$(document).ready(function() {
    $('.reviews__list').slick({
        infinite: true,
        slidesToShow: 3,
        slidesToScroll: 3,
        // centerMode: true,
        autoplay: true,
        autoplaySpeed: 2000,
        nextArrow: $('.reviews__btn-next'),
        prevArrow: $('.reviews__btn-prev'),
        dots: true,
        responsive: [
            {
              breakpoint: 740,
              settings: {
                slidesToShow: 2,
                slidesToScroll: 2,
              }
            }
          ]
    });
});

// products

ourProductsMores.forEach((ourProductsMore) => {
    ourProductsMore.onclick= function (e) {
        const readMore = e.target.previousElementSibling;
        e.target.classList.toggle('active')
        readMore.classList.toggle('active')
        readMore.classList.toggle('fade-in')
        if (readMore.classList.contains('active')) {
            e.target.innerHTML = e.target.innerHTML.replace('more','less')
        } else {
            e.target.innerHTML = e.target.innerHTML.replace('less','more')
        }
    }
})

//team 

teamMores.forEach((teamMore, index) => {
    const teamTab = teamTabs[index]
    const teamTabClose = teamTabCloses[index]

    teamMore.onclick = function () {
        overlay.classList.remove('fade-out')
        overlay.classList.add('fade-in')
        document.querySelector('body').classList.add('noscroll')
        teamTab.classList.remove('fade-out')
        teamTab.classList.add('fade-in')
    }
    
    teamTabClose.onclick = function () {
        overlay.classList.add('fade-out')
        overlay.classList.remove('fade-in')
        document.querySelector('body').classList.remove('noscroll')
        teamTab.classList.remove('fade-in')
        teamTab.classList.add('fade-out')
    }
})


const SendSubEmail = e => {
    const subEmailInput = document.getElementById('subEmail')
    fetch('/subcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            subEmail: subEmailInput.value,
          }),
      })
        .then(result => {
          return result.json();
        })
        .then(data => {
            openNotification(data.message);
            setTimeout(closeNotification, 3000);
            subEmailInput.value = "";
        })
        .catch(err => {
            console.log(err);
        });
}

