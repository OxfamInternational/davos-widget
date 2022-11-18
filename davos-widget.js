class DavosWidget {

    // Setup some base variables
    constructor(jsonPath) {
        this.jsonPath = jsonPath;
        this.htmlWrapperStr = 
        `<div class="davoswidget-questions"></div>`;
    }

    // Get the questionData from our local json file.
    async getQuestionData() {
        const filename = './davos-widget.json';
        let response = await fetch(filename);

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
            this.setupIndividual(widgetID, questionsData[widgetID], targetItem);
        });        

    }

    questionBuilder(questionData, key) {
        // <p class="davoswidget-question"></p>
        // <ul class="davoswidget-options"></ul>
        // <p class="davoswidget-response"></p>

        const questionWrapper = document.createElement('div');
        questionWrapper.setAttribute('class','davoswidget-question');
        questionWrapper.setAttribute('data-davoswidget-questionkey', key);

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

        // Setup response element.
        const responseElement = document.createElement('div');
        responseElement.setAttribute('class','davoswidget-response');
        questionWrapper.appendChild(responseElement);

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

        console.log(questionsData);

        let i = 0;
        questionsData.forEach(questionData => {
            const questionWrapper = this.questionBuilder(questionData,i);

            const targetDiv = document.querySelector('.' + selector + ' .davoswidget-questions');
            targetDiv.appendChild(questionWrapper);
            i = i+1;
        });

        // Insert the question
        // document.querySelector('.' + selector + ' .davoswidget-question').innerText = questionsData.question;

        // Insert the options
        // var ul=document.createElement('ul');
        // ul.setAttribute('class','davoswidget-options');
        
        // let optionElements = '';
        // let optionsArray = Object.keys(questionsData['options']).map((k) => questionsData['options'][k]);
        // optionsArray.map(option => {
        //     const li = document.createElement('li');
        //     const a = document.createElement('a');
        //     a.innerHTML = option;
        //     a.setAttribute('href','#');
        //     a.setAttribute('data-davoswidget-option',option);
        //     li.appendChild(a);
        //     ul.appendChild(li);
        // });
        // const targetUl = document.querySelector('.' + selector + ' .davoswidget-options');
        // targetUl.parentNode.replaceChild(ul, targetUl);

        // Add event listeners to the new links
        const optionElements = document.querySelectorAll('.' + selector + ' .davoswidget-options > li > a')
        optionElements.forEach(optionElement => {
            optionElement.addEventListener('click', function optionClicked(event) {
                let choice = this.dataset.davoswidgetOption
                let key = this.parentNode.parentNode.parentNode.dataset.davoswidgetQuestionkey;
                let resultText = '';
                if (choice === questionsData[key]['answer']) {
                    resultText = 'Correct';
                }
                else {
                    resultText = 'Wrong, the correct answer was ' + questionsData[key]['answer'];
                }
                document.querySelector('.' + selector + ' div[data-davoswidget-questionkey="' + key + '"] .davoswidget-response').innerText = resultText;

                event.preventDefault();
            });
        });
    }

}
