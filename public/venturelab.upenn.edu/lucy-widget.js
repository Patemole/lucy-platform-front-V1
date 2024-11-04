

var LucyWidget = {
    popupWindow: null, // Variable pour stocker la référence à la popup

    init: function () {
        // Création du conteneur principal
        var container = document.createElement('div');
        container.id = 'lucy-widget-container';

        // Style du conteneur principal (état initial)
        container.style.position = 'fixed';
        container.style.bottom = '60px'; // Distance du bas de la page
        container.style.left = '50%';
        container.style.transform = 'translateX(-50%)';
        container.style.width = '90%'; // Largeur du conteneur
        container.style.zIndex = '1000';
        container.style.borderRadius = '25px';
        container.style.overflow = 'hidden';
        container.style.padding = '1px'; // Espace pour le contour animé
        container.style.background = 'linear-gradient(45deg, #FF0000, #0000FF, #FF0000, #0000FF, #FF0000)'; // Dégradé rouge et bleu
        container.style.backgroundSize = '400% 400%';
        container.style.transition = 'box-shadow 0.3s ease, animation-duration 0.3s ease, max-width 0.3s ease, backdrop-filter 0.3s ease'; // Transition pour les changements de style

        // Création du conteneur interne pour le contenu
        var innerContainer = document.createElement('div');
        innerContainer.style.position = 'relative';
        innerContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; // Fond semi-transparent pour améliorer la lisibilité
        innerContainer.style.borderRadius = '10px'; // Léger arrondi
        innerContainer.style.padding = '3px 3px';
        innerContainer.style.boxSizing = 'border-box';

        // Ajout du conteneur interne au conteneur principal
        container.appendChild(innerContainer);

        // Ajout du conteneur principal au corps du document
        document.body.appendChild(container);

        // Définition des keyframes et des styles CSS
        var style = document.createElement('style');
        style.innerHTML = `
            @keyframes gradientAnimation {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            /* Style initial du conteneur */
            #lucy-widget-container {
                animation-name: gradientAnimation;
                animation-duration: 8s;
                animation-timing-function: ease;
                animation-iteration-count: infinite;
                max-width: 500px;
            }
            /* Effet au survol */
            #lucy-widget-container.hovered {
                animation-duration: 20s; /* Augmente la durée de l'animation lors du survol */
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.7); /* Ombre portée */
                max-width: 820px; /* Augmente la largeur maximale lors du survol */
                backdrop-filter: blur(20px); /* Ajout conditionnel de l'effet de flou */
            }
            /* Affichage des boutons lors du survol */
            #lucy-widget-container .buttons-container {
                display: none;
            }
            #lucy-widget-container.hovered .buttons-container {
                display: flex;
            }
        `;
        document.head.appendChild(style);

        // Initialisation de l'interface utilisateur
        this.createInterface(innerContainer, container);
    },

    createInterface: function (container, mainContainer) {
        var self = this;

        // Création de la zone de saisie
        var inputContainer = document.createElement('div');
        inputContainer.style.width = '100%';
        inputContainer.style.position = 'relative';
        inputContainer.style.marginTop = '0px';
        container.appendChild(inputContainer);

        // Création du wrapper pour le champ de saisie avec contour animé
        var inputWrapper = document.createElement('div');
        inputWrapper.className = 'input-wrapper';
        inputContainer.appendChild(inputWrapper);

        // Création du champ de saisie
        var inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.style.width = '100%';
        inputField.style.height = '50px'; // Hauteur du champ de saisie
        inputField.style.paddingTop = '15px'; // Espacement au-dessus du texte
        inputField.style.paddingBottom = '15px'; // Espacement en dessous du texte
        inputField.style.paddingLeft = '20px'; // Espacement à gauche du texte
        inputField.style.paddingRight = '50px'; // Espacement à droite pour le bouton d'envoi
        inputField.style.borderRadius = '20px';
        inputField.style.border = '1px solid #BCBCBC';
        inputField.style.fontSize = '1rem';
        inputField.style.backgroundColor = '#F4F4F4';
        inputField.style.color = '#000000';
        inputField.style.boxSizing = 'border-box';
        inputField.style.outline = 'none';
        inputField.placeholder = 'Ask me anything about VentureLab...'; // Placeholder
        inputField.style.position = 'relative';
        inputField.style.zIndex = '1'; // Assure que l'input est au-dessus du wrapper
        inputContainer.appendChild(inputField);

        // Création du bouton d'envoi à l'intérieur du champ de saisie
        var sendButton = document.createElement('button');
        sendButton.innerHTML = '<svg style="font-size: 1.2rem;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>';

        // Positionnement du bouton d'envoi
        sendButton.style.position = 'absolute';
        sendButton.style.right = '15px'; // Position par rapport au bord droit
        sendButton.style.top = '50%';
        sendButton.style.transform = 'translateY(-50%)';
        sendButton.style.border = 'none';
        sendButton.style.color = '#011F5B'; // Couleur de l'icône
        sendButton.style.background = 'none';
        sendButton.style.cursor = 'pointer'; // Indicateur de clicabilité
        sendButton.style.zIndex = '2'; // Assure que le bouton est au-dessus du wrapper
        inputContainer.appendChild(sendButton);

        // Gestion du clic sur le bouton d'envoi
        sendButton.addEventListener('click', function () {
            self.handleSend(inputField);
        });

        // Gestion de la touche Entrée
        inputField.addEventListener('keypress', function (event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                self.handleSend(inputField);
            }
        });

        // Création des boutons d'options
        var buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'buttons-container';
        buttonsContainer.style.width = '100%';
        buttonsContainer.style.marginTop = '10px'; // Marge supérieure des boutons
        buttonsContainer.style.display = 'none'; // Caché par défaut
        buttonsContainer.style.flexWrap = 'nowrap'; // Empêche le retour à la ligne
        buttonsContainer.style.justifyContent = 'center';
        buttonsContainer.style.gap = '12px'; // Espace entre les boutons
        container.appendChild(buttonsContainer);

        // Définition des boutons disponibles
        var buttons = [
            {
                label: 'Academic Info',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="20" height="20"><path fill="currentColor" d="M320 32L0 160l320 128 320-128L320 32zM64 192v128l256 128 256-128V192L320 320 64 192z"></path></svg>',
            },
            {
                label: 'Events & Tours',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="20" height="20"><path fill="currentColor" d="M152 64H296V24C296 10.7 306.7 0 320 0C333.3 0 344 10.7 344 24V64H400C426.5 64 448 85.5 448 112V464C448 490.5 426.5 512 400 512H48C21.5 512 0 490.5 0 464V112C0 85.5 21.5 64 48 64H104V24C104 10.7 114.7 0 128 0C141.3 0 152 10.7 152 24V64zM48 160V464H400V160H48z"></path></svg>',
            },
            {
                label: 'Admission',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="20" height="20"><path fill="currentColor" d="M96 96H544V320H96V96zM0 96C0 60.7 28.7 32 64 32H576C611.3 32 640 60.7 640 96V320C640 355.3 611.3 384 576 384H64C28.7 384 0 355.3 0 320V96zM48 352C21.5 352 0 373.5 0 400C0 426.5 21.5 448 48 448H592C618.5 448 640 426.5 640 400C640 373.5 618.5 352 592 352H48z"></path></svg>',
            },
            {
                label: 'Facilities',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="20" height="20"><path fill="currentColor" d="M336 0H48C21.5 0 0 21.5 0 48V512H384V48C384 21.5 362.5 0 336 0zM320 480H64V64H320V480z"></path></svg>',
            },
            {
                label: 'Financial Aid',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="20" height="20"><path fill="currentColor" d="M572.6 292.3L318.3 43.3C309.9 35.2 299.1 32 288 32s-21.9 3.2-30.3 11.3L3.4 292.3c-7.8 7.4-8.3 20-1 28.3s20 8.3 28.3 1l22.3-21.2V480c0 17.7 14.3 32 32 32H200c8.8 0 16-7.2 16-16V368c0-8.8 7.2-16 16-16H344c8.8 0 16 7.2 16 16V496c0 8.8 7.2 16 16 16H490c17.7 0 32-14.3 32-32V299.4l22.3 21.2c7.4 7.8 20 8.3 28.3 1s8.3-20 1-28.3z"></path></svg>',
            },
        ];

        // Définition des questions associées à chaque bouton
        var questionsMap = {
            'Academic Info': [
                'How can I improve my study habits?',
                'What courses should I take next semester?',
                'How do I prepare for graduate school applications?',
                'Can you help me plan my academic schedule?',
            ],
            'Events & Tours': [
                'What events are happening this semester?',
                'How can I sign up for campus tours?',
                'Are there virtual tours available?',
                'How do I get involved in campus activities?',
            ],
            'Admission': [
                'How do I apply for admission?',
                'What are the admission requirements?',
                'What is the deadline for applications?',
                'How do I check my application status?',
            ],
            'Facilities': [
                'What are the library hours?',
                'How do I reserve study rooms?',
                'Where can I find sports facilities?',
                'What dining options are available on campus?',
            ],
            'Financial Aid': [
                'What is the average financial aid package?',
                'What loans are available to students?',
                'Can you explain the financial aid process?',
                'What is the deadline to apply for financial aid?',
            ],
        };

        self.inputField = inputField;

        // Création et stylisation des boutons
        buttons.forEach(function (buttonData) {
            var button = document.createElement('button');
            button.innerHTML = buttonData.icon + ' ' + buttonData.label;
            button.style.border = '1px solid #FFFFFF';
            button.style.color = '#FFFFFF';
            button.style.borderRadius = '15px';
            button.style.padding = '6px 16px';
            button.style.fontSize = '1rem';
            button.style.cursor = 'pointer';
            button.style.display = 'flex';
            button.style.alignItems = 'center';
            button.style.gap = '8px';
            button.style.background = 'none';
            button.style.transition = 'background-color 0.3s, color 0.3s';
            button.style.textTransform = 'none';
            button.style.whiteSpace = 'nowrap'; // Empêche le texte de se diviser en plusieurs lignes

            // Effets au survol des boutons
            button.addEventListener('mouseenter', function () {
                self.handleButtonMouseEnter(buttonData.label, questionsMap[buttonData.label]);
                button.style.backgroundColor = '#011F5B';
                button.style.color = '#FFFFFF';
            });

            button.addEventListener('mouseleave', function () {
                button.style.backgroundColor = 'transparent';
                button.style.color = '#FFFFFF'; // Maintien la couleur blanche pour une meilleure lisibilité
            });

            buttonsContainer.appendChild(button);
        });

        // Conteneur pour les suggestions de questions
        self.questionsContainer = document.createElement('div');
        self.questionsContainer.style.width = '100%';
        self.questionsContainer.style.maxWidth = '800px';
        self.questionsContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'; // Fond semi-transparent
        self.questionsContainer.style.border = '1px solid #BCBCBC';
        self.questionsContainer.style.borderRadius = '8px';
        self.questionsContainer.style.padding = '20px';
        self.questionsContainer.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        self.questionsContainer.style.marginTop = '10px';
        self.questionsContainer.style.display = 'none';
        // Centrage horizontal du conteneur des questions
        self.questionsContainer.style.margin = '10px auto 0 auto';
        container.appendChild(self.questionsContainer);

        self.activeButton = null;
        self.isHoveringQuestions = false;

        // Gestion du survol du conteneur principal pour afficher les boutons
        mainContainer.addEventListener('mouseenter', function () {
            mainContainer.classList.add('hovered');
            buttonsContainer.style.display = 'flex';
            // La durée de l'animation est gérée via CSS
        });

        mainContainer.addEventListener('mouseleave', function () {
            if (!self.isHoveringQuestions) {
                mainContainer.classList.remove('hovered');
                buttonsContainer.style.display = 'none';
                self.questionsContainer.style.display = 'none';
                // La largeur maximale est réinitialisée via CSS
            }
        });

        // Gestion du survol du conteneur de questions
        self.questionsContainer.addEventListener('mouseenter', function () {
            self.isHoveringQuestions = true;
        });

        self.questionsContainer.addEventListener('mouseleave', function () {
            self.isHoveringQuestions = false;
            // Ne pas masquer immédiatement le conteneur de questions
            // Permet à l'utilisateur de passer d'un bouton à l'autre sans fermeture
        });

        // Gestion du clic en dehors du widget pour le replier
        document.addEventListener('mousedown', function (event) {
            var target = event.target;
            if (!mainContainer.contains(target)) {
                mainContainer.classList.remove('hovered');
                buttonsContainer.style.display = 'none';
                self.questionsContainer.style.display = 'none';
                // La largeur maximale est réinitialisée via CSS
                self.activeButton = null;
                inputField.value = '';
                inputField.placeholder = 'Ask me anything about VentureLab...';
            }
        });

        // Gestion des changements dans le champ de saisie
        self.inputField.addEventListener('input', function () {
            if (self.inputField.value.trim() === '') {
                self.activeButton = null;
                // Ne pas masquer immédiatement le conteneur de questions
                // Permet à l'utilisateur de taper la question qu'il a vue
            }
        });
    },

    handleSend: function (inputField) {
        var message = inputField.value.trim();
        if (message === '') return;

        // Traitement de l'envoi du message
        console.log('Message sent:', message);
        inputField.value = '';
        this.activeButton = null;
        this.questionsContainer.style.display = 'none';
        this.inputField.placeholder = 'Ask me anything about VentureLab...';

        // Ouvrir la fenêtre popup avec le chat
        this.openChatPopup();
    },

    handleButtonMouseEnter: function (buttonLabel, questions) {
        var self = this;
        self.activeButton = buttonLabel;
        self.questionsContainer.innerHTML = '';
        self.questionsContainer.style.display = 'block';

        if (questions && questions.length > 0) {
            questions.forEach(function (question, index) {
                var questionElement = document.createElement('div');
                questionElement.className = 'question-item'; // Ajout de la classe
                questionElement.innerText = question;
                questionElement.style.padding = '8px 0';
                questionElement.style.cursor = 'pointer'; // Indique que l'élément est cliquable
                questionElement.style.fontSize = '1rem';
                questionElement.style.color = '#333';
                questionElement.style.transition = 'background-color 0.3s';
                questionElement.style.borderRadius = '4px';

                // Effets au survol des questions
                questionElement.addEventListener('mouseenter', function () {
                    questionElement.style.backgroundColor = '#F0F0F0';
                    self.inputField.value = question;
                });
                questionElement.addEventListener('mouseleave', function () {
                    questionElement.style.backgroundColor = 'transparent';
                    self.inputField.value = '';
                });

                // Action au clic sur une question
                questionElement.addEventListener('click', function () {
                    self.handleSendQuestion(question);
                });

                self.questionsContainer.appendChild(questionElement);

                // Ajout d'un diviseur entre les questions
                if (index < questions.length - 1) {
                    var divider = document.createElement('hr');
                    divider.style.width = '100%';
                    divider.style.border = 'none';
                    divider.style.borderTop = '1px solid #BCBCBC';
                    self.questionsContainer.appendChild(divider);
                }
            });
        }
    },

    handleSendQuestion: function (question) {
        // Traitement de l'envoi de la question
        console.log('Question sent:', question);
        this.inputField.value = '';
        this.activeButton = null;
        this.questionsContainer.style.display = 'none';
        this.inputField.placeholder = 'Ask me anything about VentureLab...';

        // Ouvrir la fenêtre popup avec le chat
        this.openChatPopup();
    },

    openChatPopup: function () {
        // Vérifier si la popup est déjà ouverte et non fermée
        if (this.popupWindow && !this.popupWindow.closed) {
            this.popupWindow.focus();
            return;
        }

        // Ouvrir une nouvelle fenêtre popup
        this.popupWindow = window.open(
            '', // URL vide pour générer une page vide que nous allons remplir
            'ChatWindow', // Nom de la fenêtre
            'width=400,height=600,resizable=yes,scrollbars=yes'
        );

        // Vérifier si la popup a été bloquée
        if (!this.popupWindow) {
            alert('Popup bloquée par le navigateur. Veuillez autoriser les popups pour ce site.');
            return;
        }

        // Contenu HTML de la popup
        var popupContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Chat</title>
                <style>
                    body {
                        margin: 0;
                        padding: 0;
                        font-family: Arial, sans-serif;
                        background-color: #f0f0f0;
                        display: flex;
                        flex-direction: column;
                        height: 100vh;
                    }
                    #chat-header {
                        background-color: #011F5B;
                        color: white;
                        padding: 10px;
                        text-align: center;
                        font-size: 1.2rem;
                    }
                    #chat-messages {
                        flex: 1;
                        padding: 10px;
                        overflow-y: auto;
                        background-color: #ffffff;
                    }
                    #chat-input-container {
                        display: flex;
                        padding: 10px;
                        background-color: #e0e0e0;
                    }
                    #chat-input {
                        flex: 1;
                        padding: 10px;
                        border: 1px solid #ccc;
                        border-radius: 5px;
                        font-size: 1rem;
                    }
                    #chat-send-button {
                        margin-left: 10px;
                        padding: 10px 20px;
                        background-color: #011F5B;
                        color: white;
                        border: none;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 1rem;
                    }
                    #chat-send-button:hover {
                        background-color: #014080;
                    }
                </style>
            </head>
            <body>
                <div id="chat-header">Chat</div>
                <div id="chat-messages"></div>
                <div id="chat-input-container">
                    <input type="text" id="chat-input" placeholder="Type your message here..." />
                    <button id="chat-send-button">Send</button>
                </div>

                <script>
                    // Fonction pour ajouter un message au chat
                    function addMessage(message, sender) {
                        var messagesContainer = document.getElementById('chat-messages');
                        var messageElement = document.createElement('div');
                        messageElement.style.marginBottom = '10px';
                        messageElement.style.padding = '10px';
                        messageElement.style.borderRadius = '5px';
                        messageElement.style.backgroundColor = sender === 'user' ? '#DCF8C6' : '#ECECEC';
                        messageElement.style.alignSelf = sender === 'user' ? 'flex-end' : 'flex-start';
                        messageElement.innerText = message;
                        messagesContainer.appendChild(messageElement);
                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    }

                    // Gestion du clic sur le bouton d'envoi
                    document.getElementById('chat-send-button').addEventListener('click', function() {
                        var inputField = document.getElementById('chat-input');
                        var message = inputField.value.trim();
                        if (message === '') return;
                        addMessage(message, 'user');
                        inputField.value = '';

                        // Exemple de réponse automatique (à remplacer par votre logique)
                        setTimeout(function() {
                            addMessage('This is an automated response.', 'bot');
                        }, 1000);
                    });

                    // Gestion de la touche Entrée dans le champ de saisie
                    document.getElementById('chat-input').addEventListener('keypress', function(event) {
                        if (event.key === 'Enter' && !event.shiftKey) {
                            event.preventDefault();
                            document.getElementById('chat-send-button').click();
                        }
                    });
                </script>
            </body>
            </html>
        `;

        // Écrire le contenu dans la popup
        this.popupWindow.document.open();
        this.popupWindow.document.write(popupContent);
        this.popupWindow.document.close();
    },
};

// Initialisation du widget au chargement de la page
window.addEventListener('DOMContentLoaded', function () {
    LucyWidget.init();
});




