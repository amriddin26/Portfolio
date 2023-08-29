let words = document.querySelectorAll(".word");
words.forEach((word)=>{
    let letters = word.textContent.split("");
    word.textContent="";
    letters.forEach((letters)=>{
       let span = document.createElement("span");
       span.textContent = letters;
       span.className = "letter";
       word.append(span);
    });
});

let currentWordIndex = 0;
let maxWordIndex = words.length -1;
words[currentWordIndex].style.opacity ="1";


let chandeText = () =>{
    let currentWord = words[currentWordIndex];
    let nextWord = currentWordIndex === maxWordIndex ? words[0] : words[currentWordIndex + 1];


   Array.from(currentWord.children).forEach((letters,i)=>{
       setTimeout(()=>{
        letters.className = "letter out";
       },i * 80);
       nextWord.style.opacity="1";
       Array.from(nextWord.children).forEach((letter,i)=>{
        letter.className = "letter behind";
        setTimeout(()=>{
            letter.className = "letter in";
        },340 + i * 80);
       });
   });
   currentWordIndex = currentWordIndex === maxWordIndex ? 0 : currentWordIndex + 1;
};

chandeText();
setInterval(chandeText,3000);

// var mixer = mixitu  ///////////////////

var mixer = mixitup('.portfolio-gellery');
var mixer = mixitup('.portfolio-gellery');