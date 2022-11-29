

function buildCta(ctaData) {
    const cta = document.createElement('a');
    cta.innerHTML = ctaData.linktext;
    if (ctaData.type === 'tweet') {
        cta.setAttribute('href', 'https://twitter.com/intent/tweet?button_hashtag=LoveTwitter&ref_src=twsrc%5Etfw');
        cta.setAttribute('data-show-count', 'false');
        cta.setAttribute('class', 'twitter-hashtag-button');
    }
    else if (ctaData.type === 'url') {
        cta.setAttribute('href', ctaData.url);
        cta.setAttribute('class', 'davoswidget-cta');
    }
    return cta;
}

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

    questionBuilder(questionData, key, widgetID) {

        const questionType = questionData['type'];

        const questionWrapper = document.createElement('div');
        questionWrapper.setAttribute('class','davoswidget-question davoswidget-question-type-' + questionType);
        questionWrapper.setAttribute('data-davoswidget-questionkey', key);

        if (questionType === "options") {
            // Setup the question element
            const questionElement = document.createElement('p');
            questionElement.setAttribute('class','davoswidget-question-text');
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
            questionElement.setAttribute('class','davoswidget-question-text');
            questionElement.innerHTML = questionData.question + '<p>Please select all that apply</p>';
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
            submit.innerHTML = "Submit";
            questionWrapper.appendChild(submit);
        }
        if (questionType === "currency") {
            var qaWrapper=document.createElement('div');
            qaWrapper.setAttribute('class', 'flex');

            // Setup the question element
            const questionElement = document.createElement('p');
            questionElement.setAttribute('class','davoswidget-question');
            questionElement.innerHTML = questionData.question;
            qaWrapper.appendChild(questionElement);

            // Setup the currency label element
            var label=document.createElement('label');
            label.setAttribute('for',widgetID);
            label.innerHTML = 'USD';
            qaWrapper.appendChild(label);

            // Setup the number elements
            var textfield=document.createElement('input');
            textfield.setAttribute('type','number');
            textfield.setAttribute('placeholder','10');
            textfield.setAttribute('name',widgetID);
            textfield.setAttribute('id',widgetID);
            qaWrapper.appendChild(textfield);

            const submit = document.createElement('a');
            submit.setAttribute('href','#');
            submit.setAttribute('class', 'davoswidget-submit');
            submit.innerHTML = "Submit";
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
            const questionWrapper = this.questionBuilder(questionData,i, widgetID);
            const targetDiv = document.querySelector('.' + selector + ' .davoswidget-questions');
            targetDiv.appendChild(questionWrapper);
            if (i > 0) {
                questionWrapper.hidden = true;
            }
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
                    const ctaElementWrapper = document.querySelector('.' + selector + ' div[data-davoswidget-questionkey="' + key + '"] .davoswidget-cta-wrapper');
                    const cta = buildCta(questionsData[key].cta);
                    ctaElementWrapper.parentNode.replaceChild(cta, ctaElementWrapper);
                    if (questionsData[key].cta.type === 'tweet') {
                        twttr.widgets.load(
                            document.getElementById("container")
                        );
                    }
                }

                submitLink.remove();

                // Add disabled class to options on this widget.
                const optionElements = document.querySelectorAll('.' + selector + ' .davoswidget-multiplechoice > li > a')
                optionElements.forEach(optionElementDisable => {
                    optionElementDisable.classList.add("disabled");
                });

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
                const clickedButton = document.querySelector('.' + selector + ' div[data-davoswidget-questionkey="' + key + '"] a[data-davoswidget-option="' + choice + '"]');

                // The options can only be clicked once, this allows disabling and styling.
                if (clickedButton.classList.contains("disabled")) {
                    event.preventDefault();
                    return;
                }
                
                // Specific responses depending on choice
                if (questionsData[key].hasOwnProperty('responses')) {
                    resultText = resultText + questionsData[key].responses[choice] + ' ';
                }
                // Single response
                else if (questionsData[key].hasOwnProperty('response')) {
                    resultText = resultText + questionsData[key].response;
                }
                // Reponse to show after the answer is rendered
                else if (questionsData[key].hasOwnProperty('response_post')) {
                    resultText = questionsData[key]['answer'] + ' ' + questionsData[key]['response_post'];
                }

                document.querySelector('.' + selector + ' div[data-davoswidget-questionkey="' + key + '"] .davoswidget-response').innerText = resultText;

                // Manage the .active class
                const activeButtons = document.querySelectorAll('.' + selector + ' div[data-davoswidget-questionkey="' + key + '"] .active');
                activeButtons.forEach(activeButton => {
                    activeButton.classList.remove("active");
                });
                
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
                    const ctaElementWrapper = document.querySelector('.' + selector + ' div[data-davoswidget-questionkey="' + key + '"] .davoswidget-cta-wrapper');
                    const ctaElement = document.querySelector('.' + selector + ' div[data-davoswidget-questionkey="' + key + '"] .davoswidget-cta-wrapper > *');
                    const cta = buildCta(questionsData[key].cta);
                    ctaElementWrapper.replaceChild(cta, ctaElement);
                    if (questionsData[key].cta.type === 'tweet') {
                        twttr.widgets.load(
                            document.getElementById("container")
                        );
                    }
                }

                // Add disabled class to options on this widget.
                const elementClicked = event.target;
                const clickedSet = elementClicked.parentNode.parentNode.parentNode.dataset.davoswidgetQuestionkey
                const optionElementsToDisable = document.querySelectorAll('.' + selector + ' .davoswidget-question:nth-child(' + (parseInt(clickedSet)+1) + ') .davoswidget-options > li > a')
                optionElementsToDisable.forEach(optionElementDisable => {
                    optionElementDisable.classList.add("disabled");
                });
                
                event.preventDefault();
            });
        });
    }

}
