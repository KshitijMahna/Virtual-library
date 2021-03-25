const sliders = document.querySelectorAll(".slide")

history.scrollRestoration = "manual";

const appearOptions = {
 
    threshold: 0,
    rootmargin: "0px, 0px, -100px, 0px"
    
};

const appearOnScroll = new IntersectionObserver((entries, appearOnScroll)=>
{
    entries.forEach(entry => {

        if(!entry.isIntersecting){
            
            return;

        }else{

            entry.target.classList.add("appear");
            appearOnScroll.unobserve(entry.target);
        }
    })
}, appearOptions);


sliders.forEach(slide => {
    appearOnScroll.observe(slide);
});