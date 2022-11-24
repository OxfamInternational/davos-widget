class DavosWidget {

    // Setup some base variables
    constructor(ctaJsonPath, coreJsonPath) {
        this.jsonPath = coreJsonPath;
        this.ctaJsonPath = ctaJsonPath;
        this.htmlWrapperStr = 
        `<div class="davoswidget-questions"></div>`;
    }

    // Get the questionData from our local json file.
    async getQuestionData(path, path2) {
        const fetchReq1 = fetch(path).then((res) => res.json());
        const fetchReq2 = fetch(path2).then((res) => res.json());

        const allData = Promise.all([fetchReq1, fetchReq2]);

        // merge into a single mergedQuestionsData object.
        let response = await allData.then((res) => {
            let mergedQuestionsData = res[0];
            for (const objkey in res[0].questions) {
                let questions = mergedQuestionsData.questions[objkey];
                for (let i = 0; i < questions.length; i++) {
                    if (res[1].questions[objkey][i]['cta']['url'] !== "") {
                        mergedQuestionsData.questions[objkey][i].cta = res[1].questions[objkey][i]['cta'];
                    }
                }
            }
            this.mergedQuestionsData = mergedQuestionsData;
        });

    }
  
    // Setup the widgets.
    async setup() {
        // Get all the questionData for the various widgets.
        await this.getQuestionData(this.jsonPath, this.ctaJsonPath);
        const questionsData = this.json;
        const ctaData = this.ctaJson;

        // Setup the individual widget with listeners
        const targetItems = document.querySelectorAll('.davoswidget');
        
        targetItems.forEach(targetItem => {
            var widgetID = targetItem.dataset.widget;
            // Check widget exists to limit errors in the JSON.
            if (this.mergedQuestionsData.questions.hasOwnProperty(widgetID)) {
                this.setupIndividual(widgetID, this.mergedQuestionsData.questions[widgetID], targetItem);
            }
        });        

    }

    questionBuilder(questionData, key) {

        const questionType = questionData['type'];

        const questionWrapper = document.createElement('div');
        questionWrapper.setAttribute('class','davoswidget-question davoswidget-question-type-' + questionType);
        questionWrapper.setAttribute('data-davoswidget-questionkey', key);

        

        

        if (questionType === "options") {
            // Setup the question element
            const questionElement = document.createElement('p');
            questionElement.innerHTML = questionData.question;
            questionWrapper.appendChild(questionElement);

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
            // Setup the question element
            const questionElement = document.createElement('p');
            questionElement.innerHTML = questionData.question;
            questionWrapper.appendChild(questionElement);

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
        if (questionType === "currency") {
            var qaWrapper=document.createElement('div');
            qaWrapper.setAttribute('class', 'flex');

            // Setup the question element
            const questionElement = document.createElement('p');
            questionElement.innerHTML = questionData.question;
            qaWrapper.appendChild(questionElement);

            // Setup the option elements
            var textfield=document.createElement('input');
            textfield.setAttribute('type','text');
            qaWrapper.appendChild(textfield);


            const submit = document.createElement('a');
            submit.setAttribute('href','#');
            submit.setAttribute('class', 'davoswidget-submit');
            submit.innerHTML = "Submit response";
            questionWrapper.appendChild(qaWrapper);
            questionWrapper.appendChild(submit);
        }

        // Setup response element.
        const responseElement = document.createElement('div');
        responseElement.setAttribute('class','davoswidget-response');
        questionWrapper.appendChild(responseElement);

        // Setup cta element.
        const ctaElementWrapper = document.createElement('div');
        ctaElementWrapper.setAttribute('class','davoswidget-cta-wrapper');
        const ctaElement = document.createElement('span');
        // ctaElement.setAttribute('class','davoswidget-cta');
        ctaElementWrapper.appendChild(ctaElement);
        questionWrapper.appendChild(ctaElementWrapper);

        // Setup next element.
        const nextElementWrapper = document.createElement('div');
        nextElementWrapper.setAttribute('class','davoswidget-next-wrapper');
        const nextElement = document.createElement('span');
        nextElementWrapper.appendChild(nextElement);
        questionWrapper.appendChild(nextElementWrapper);

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

                // CTA
                if (questionsData[key].hasOwnProperty('cta')) {
                    const cta = document.createElement('a');
                    cta.innerHTML = questionsData[key].cta.linktext;
                    cta.setAttribute('href', questionsData[key].cta.url);
                    cta.setAttribute('class', 'davoswidget-cta');

                    const ctaElementWrapper = document.querySelector('.' + selector + ' div[data-davoswidget-questionkey="' + key + '"] .davoswidget-cta-wrapper');
                    ctaElementWrapper.parentNode.replaceChild(cta, ctaElementWrapper);
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
                if (questionsData[key].hasOwnProperty('responses')) {
                    resultText = resultText + questionsData[key].responses[choice] + ' ';
                }
                if (questionsData[key].hasOwnProperty('response')) {
                    resultText = resultText + questionsData[key].response;
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

                // Is there another question after this one?
                const arraySize = questionsData.length -1;
                const currentQuestionKey = parseInt(key)
                if (currentQuestionKey < arraySize) {
                    const next = document.createElement('a');
                    next.innerHTML = "Next Question";
                    next.setAttribute('href', '#');
                    next.setAttribute('class', 'davoswidget-next');
                    const nextElementWrapper = document.querySelector('.' + selector + ' div[data-davoswidget-questionkey="' + key + '"] .davoswidget-next-wrapper');
                    const nextElement = document.querySelector('.' + selector + ' div[data-davoswidget-questionkey="' + key + '"] .davoswidget-next-wrapper > *');
                    nextElementWrapper.replaceChild(next, nextElement);
                    next.addEventListener('click', function optionClicked(event) {
                        // Hide/Show questions
                        let questions = document.querySelectorAll('.' + selector + ' .davoswidget-question');
                        questions.forEach(question => {
                            question.hidden = true;
                        });
                        let currentQuestion = document.querySelector('.' + selector + ' .davoswidget-question:nth-child(' + (currentQuestionKey+2) + ')');
                        currentQuestion.hidden = false;
                        event.preventDefault();
                    });

                    
                }

                // CTA
                if (questionsData[key].hasOwnProperty('cta')) {
                    const cta = document.createElement('a');
                    cta.innerHTML = questionsData[key].cta.linktext;
                    cta.setAttribute('href', questionsData[key].cta.url);
                    cta.setAttribute('class', 'davoswidget-cta');
                    const ctaElementWrapper = document.querySelector('.' + selector + ' div[data-davoswidget-questionkey="' + key + '"] .davoswidget-cta-wrapper');
                    const ctaElement = document.querySelector('.' + selector + ' div[data-davoswidget-questionkey="' + key + '"] .davoswidget-cta-wrapper > *');
                    ctaElementWrapper.replaceChild(cta, ctaElement);
                }

                event.preventDefault();
            });
        });
    }

}
