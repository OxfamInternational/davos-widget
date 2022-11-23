class DavosWidget {

    // Setup some base variables
    constructor(jsonPath) {
        this.jsonPath = jsonPath;
        this.htmlWrapperStr = 
        `<div class="davoswidget-questions"></div>`;
    }

    // Get the questionData from our local json file.
    async getQuestionData() {
        let response = await fetch(this.jsonPath);

        if (response.status === 200) {
            let json = await response.json();
            this.json = json;
        }
    }
  
    // Setup the widgets.
    async setup() {
        // Get all the questionData for the various widgets.
        await this.getQuestionData();
        const questionsData = this.json;
        
        // Setup the individual widget with listeners
        const targetItems = document.querySelectorAll('.davoswidget');
        
        targetItems.forEach(targetItem => {
            var widgetID = targetItem.dataset.widget;
            // Check widget exists to limit errors in the JSON.
            if (questionsData.questions.hasOwnProperty(widgetID)) {
                this.setupIndividual(widgetID, questionsData.questions[widgetID], targetItem);
            }
        });        

    }

    questionBuilder(questionData, key) {

        const questionWrapper = document.createElement('div');
        questionWrapper.setAttribute('class','davoswidget-question');
        questionWrapper.setAttribute('data-davoswidget-questionkey', key);

        // Setup the question element
        const questionElement = document.createElement('p');
        questionElement.innerHTML = questionData.question;
        questionWrapper.appendChild(questionElement);

        const questionType = questionData['type'];

        if (questionType === "options") {
            // Setup the option elements
            var ul=document.createElement('ul');
            ul.setAttribute('class','davoswidget-options');
            let optionsArray = Object.keys(questionData['options']).map((k) => questionData['options'][k]);
            optionsArray.map(option => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.innerHTML = option;
                a.setAttribute('href','#');
                a.setAttribute('data-davoswidget-option',option);
                li.appendChild(a);
                ul.appendChild(li);
            });
            questionWrapper.appendChild(ul);
        }
        if (questionType === "multiplechoice") {
            // Setup the option elements
            var ul=document.createElement('ul');
            ul.setAttribute('class','davoswidget-multiplechoice');
            let optionsArray = Object.keys(questionData['options']).map((k) => questionData['options'][k]);
            optionsArray.map(option => {
                const li = document.createElement('li');
                const a = document.createElement('a');
                a.innerHTML = option;
                a.setAttribute('href','#');
                a.setAttribute('data-davoswidget-option',option);
                li.appendChild(a);
                ul.appendChild(li);
            });
            questionWrapper.appendChild(ul);

            const submit = document.createElement('a');
            submit.setAttribute('href','#');
            submit.setAttribute('class', 'davoswidget-submit');
            submit.innerHTML = "Submit response";
            questionWrapper.appendChild(submit);
        }
        if (questionType === "text") {
            // Setup the option elements
            var textarea=document.createElement('textarea');
            questionWrapper.appendChild(textarea);
            const submit = document.createElement('a');
            submit.setAttribute('href','#');
            submit.setAttribute('class', 'davoswidget-submit');
            submit.innerHTML = "Submit response";
            questionWrapper.appendChild(submit);
        }

        // Setup response element.
        const responseElement = document.createElement('div');
        responseElement.setAttribute('class','davoswidget-response');
        questionWrapper.appendChild(responseElement);

        // Setup cta element.
        const ctaElement = document.createElement('div');
        ctaElement.setAttribute('class','davoswidget-cta-wrapper');
        questionWrapper.appendChild(ctaElement);

        return questionWrapper;
        
    }

    // Setup an individual widget.
    setupIndividual(widgetID, questionsData, targetItem) {
        const selector = 'davoswidget-' + widgetID;
        // Replace the placeholder token
        var wrapper = document.createElement("div");
        wrapper.setAttribute('class','davoswidget ' + selector);

        wrapper.innerHTML = this.htmlWrapperStr;
        targetItem.parentNode.replaceChild(wrapper, targetItem);

        let i = 0;
        questionsData.forEach(questionData => {
            const questionWrapper = this.questionBuilder(questionData,i);
            const targetDiv = document.querySelector('.' + selector + ' .davoswidget-questions');
            targetDiv.appendChild(questionWrapper);
            i = i+1;
        });

        // Add event listeners (submit)
        const submitLink = document.querySelector('.' + selector + ' .davoswidget-submit');
        if (submitLink) {
            submitLink.addEventListener('click', function optionClicked(event) {
                let key = this.parentNode.dataset.davoswidgetQuestionkey;
                if (questionsData[key].hasOwnProperty('response')) {
                    let resultText = questionsData[key].response;
                    document.querySelector('.' + selector + ' div[data-davoswidget-questionkey="' + key + '"] .davoswidget-response').innerText = resultText;
                }
                event.preventDefault();
            });
        }

        // Add event listeners (multiplechoice)
        const multipleChoiceElements = document.querySelectorAll('.' + selector + ' .davoswidget-multiplechoice > li > a')
        multipleChoiceElements.forEach(multipleChoiceElement => {
            multipleChoiceElement.addEventListener('click', function optionClicked(event) {
                let choice = this.dataset.davoswidgetOption
                let key = this.parentNode.parentNode.parentNode.dataset.davoswidgetQuestionkey;

                // Manage the .active class
                const clickedButton = document.querySelector('.' + selector + ' div[data-davoswidget-questionkey="' + key + '"] a[data-davoswidget-option="' + choice + '"]');

                if (clickedButton.classList.contains('active')) {
                    clickedButton.classList.remove("active");
                }
                else {
                    clickedButton.classList.add("active");
                }

                event.preventDefault();
            });
        });

        // Add event listeners (options)
        const optionElements = document.querySelectorAll('.' + selector + ' .davoswidget-options > li > a')
        optionElements.forEach(optionElement => {
            optionElement.addEventListener('click', function optionClicked(event) {
                let choice = this.dataset.davoswidgetOption
                let key = this.parentNode.parentNode.parentNode.dataset.davoswidgetQuestionkey;
                let resultText = '';
                if (questionsData[key].hasOwnProperty('response')) {
                    resultText = questionsData[key].response;
                }
                else if (choice === questionsData[key]['answer']) {
                    resultText = 'Correct';
                }
                else {
                    resultText = 'Wrong, the correct answer was ' + questionsData[key]['answer'];
                }
                document.querySelector('.' + selector + ' div[data-davoswidget-questionkey="' + key + '"] .davoswidget-response').innerText = resultText;

                // Manage the .active class
                const activeButtons = document.querySelectorAll('.' + selector + ' div[data-davoswidget-questionkey="' + key + '"] .active');
                activeButtons.forEach(activeButton => {
                    activeButton.classList.remove("active");
                });
                const clickedButton = document.querySelector('.' + selector + ' div[data-davoswidget-questionkey="' + key + '"] a[data-davoswidget-option="' + choice + '"]');
                clickedButton.classList.add("active");

                // CTA
                if (questionsData[key].hasOwnProperty('cta')) {
                    console.log(questionsData[key].cta.url)

                    const cta = document.createElement('a');
                    cta.innerHTML = questionsData[key].cta.linktext;
                    cta.setAttribute('href', questionsData[key].cta.url);
                    cta.setAttribute('class', 'davoswidget-cta');

                    const ctaElementWrapper = document.querySelector('.' + selector + ' div[data-davoswidget-questionkey="' + key + '"] .davoswidget-cta-wrapper');
                    ctaElementWrapper.parentNode.replaceChild(cta, ctaElementWrapper);
                }

                event.preventDefault();
            });
        });
    }

}
