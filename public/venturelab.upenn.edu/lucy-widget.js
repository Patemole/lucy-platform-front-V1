

// lucy-widget.js

// lucy-widget.js
// lucy-widget.js

// lucy-widget.js

// lucy-widget.js

// lucy-widget.js

// lucy-widget.js

// lucy-widget.js

var LucyWidget = (function () {
    return {
        init: function (options) {
            // Définitions par défaut des options
            options = options || {};
            this.containerSelector = options.container || '#lucy-widget-container';
            this.university = options.university || 'University Name';
            this.theme = options.theme || 'light';
            this.language = options.language || 'fr';

            // Récupère l'élément conteneur existant
            this.container = document.querySelector(this.containerSelector);
            if (!this.container) {
                console.error('Conteneur non trouvé : ' + this.containerSelector);
                return;
            }

            // Applique les styles globaux au conteneur
            this.container.style.position = 'fixed';
            this.container.style.bottom = '60px'; // Distance du bas de la page
            this.container.style.left = '50%';
            this.container.style.transform = 'translateX(-50%)';
            this.container.style.width = '90%'; // Largeur du conteneur
            this.container.style.zIndex = '1000';
            this.container.style.borderRadius = '25px';
            this.container.style.overflow = 'hidden';
            this.container.style.padding = '1px'; // Espace pour le contour animé
            this.container.style.background = 'linear-gradient(45deg, #FF0000, #0000FF, #FF0000, #0000FF, #FF0000)'; // Dégradé rouge et bleu
            this.container.style.backgroundSize = '400% 400%';
            this.container.style.transition = 'box-shadow 0.3s ease, animation-duration 0.3s ease, max-width 0.3s ease, backdrop-filter 0.3s ease'; // Transition pour les changements de style

            // Vérifie si le widget a déjà été initialisé
            if (this.container.getAttribute('data-initialized') === 'true') {
                console.warn('LucyWidget est déjà initialisé sur ce conteneur.');
                return;
            }

            // Marque le conteneur comme initialisé
            this.container.setAttribute('data-initialized', 'true');

            // Définition des keyframes et des styles CSS
            var style = document.createElement('style');
            style.innerHTML = `
                @keyframes gradientAnimation {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                /* Animation du conteneur */
                ${this.containerSelector} {
                    animation-name: gradientAnimation;
                    animation-duration: 8s;
                    animation-timing-function: ease;
                    animation-iteration-count: infinite;
                    max-width: 500px;
                }
                /* Effet au survol */
                ${this.containerSelector}.hovered {
                    animation-duration: 20s; /* Augmente la durée de l'animation lors du survol */
                    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.7); /* Ombre portée */
                    max-width: 820px; /* Augmente la largeur maximale lors du survol */
                    backdrop-filter: blur(20px); /* Ajout conditionnel de l'effet de flou */
                }
                /* Affichage des boutons lors du survol */
                ${this.containerSelector} .buttons-container {
                    display: none;
                }
                ${this.containerSelector}.hovered .buttons-container {
                    display: flex;
                }
                /* Style pour les boutons dans la modale */
                #overlayModal button {
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-size: 1rem;
                }
            `;
            document.head.appendChild(style);

            // Création du conteneur interne pour le contenu
            var innerContainer = document.createElement('div');
            innerContainer.style.position = 'relative';
            innerContainer.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'; // Fond semi-transparent pour améliorer la lisibilité
            innerContainer.style.borderRadius = '10px'; // Léger arrondi
            innerContainer.style.padding = '3px 3px';
            innerContainer.style.boxSizing = 'border-box';
            this.container.appendChild(innerContainer);

            // Initialisation de l'interface utilisateur
            this.createInterface(innerContainer, this.container);

            // Création de la modale
            this.createModal();

            // Vérifie si la modale doit être ouverte lors du chargement
            this.checkModalState();
        },

        createInterface: function (container, mainContainer) {
            var self = this;

            // Création de la zone de saisie
            var inputContainer = document.createElement('div');
            inputContainer.style.width = '100%';
            inputContainer.style.position = 'relative';
            inputContainer.style.marginTop = '0px';
            container.appendChild(inputContainer);

            // Création du champ de saisie
            var inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.style.width = '100%';
            inputField.style.height = '50px'; // Hauteur du champ de saisie
            inputField.style.padding = '15px 20px';
            inputField.style.borderRadius = '20px';
            inputField.style.border = '1px solid #BCBCBC';
            inputField.style.fontSize = '1rem';
            inputField.style.backgroundColor = '#F4F4F4';
            inputField.style.color = '#000000';
            inputField.style.boxSizing = 'border-box';
            inputField.style.outline = 'none';
            inputField.placeholder = this.language === 'fr' ? 'What are you looking for?' : 'What are you looking for?'; // Placeholder
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
                    icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="20" height="20"><path fill="currentColor" d="M572.6 292.3L318.3 43.3C309.9 35.2 299.1 32 288 32s-21.9 3.2-30.3 11.3L3.4 292.3c-7.8 7.4-8.3 20-1 28.3s20 8.3 28.3 1l22.3-21.2V480c0 17.7 14.3 32 32 32H200c8.8 0 16-7.2 16-16V368c0-8.8 7.2-16 16-16H344c8.8 0 16 7.2 16 16V496c0 8.8 7.2 16 16 16H490c17.7 0 32-14.3 32-32V299.4l22.3 21.2c7.4 7.8 20 8.3 28.3 1s8.3-20 1-28.3z"></path></svg>',
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

            // Création et stylisation des boutons d'options
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
                    button.style.color = '#FFFFFF'; // Maintient la couleur blanche pour une meilleure lisibilité
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
                    inputField.placeholder = self.language === 'fr' ? 'What are you looking for?' : 'What are you looking for?';
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

            // === Suppression du bouton "Ouvrir Chat" ===
            // Aucun bouton supplémentaire n'est créé ici

            // === Fin de la suppression du bouton "Ouvrir Chat" ===
        },

        createModal: function () {
            var self = this;

            // Vérifie si le modal existe déjà dans le DOM
            if (document.getElementById('overlayModal')) {
                return; // Évite de recréer le modal si il existe déjà
            }

            // Création du conteneur principal de l'overlay
            var overlayModal = document.createElement('div');
            overlayModal.id = 'overlayModal';
            overlayModal.style.display = 'none'; // Masqué par défaut
            overlayModal.style.position = 'fixed';
            overlayModal.style.top = '5%';
            overlayModal.style.right = '0';
            overlayModal.style.width = '40%';
            overlayModal.style.height = '103%';
            overlayModal.style.backgroundColor = 'transparent';
            overlayModal.style.zIndex = '1000';
            overlayModal.style.display = 'flex';
            overlayModal.style.justifyContent = 'center';
            overlayModal.style.alignItems = 'center';

            // Création du conteneur interne du modal
            var modalContent = document.createElement('div');
            modalContent.style.position = 'absolute';
            modalContent.style.top = '50%';
            modalContent.style.left = '60%';
            modalContent.style.transform = 'translate(-50%, -50%)';
            modalContent.style.width = '80%';
            modalContent.style.height = '80%';
            modalContent.style.backgroundColor = 'transparent'; // Fond transparent
            modalContent.style.borderRadius = '20px';
            modalContent.style.overflow = 'hidden';
            modalContent.style.pointerEvents = 'all';

            // Création du bouton de fermeture dans le modal
            var closeButton = document.createElement('button');
            closeButton.id = 'closeModalButton';
            closeButton.innerHTML = '&times;';
            closeButton.style.position = 'absolute';
            closeButton.style.top = '10px';
            closeButton.style.right = '10px';
            closeButton.style.background = 'none';
            closeButton.style.border = 'none';
            closeButton.style.cursor = 'pointer';
            closeButton.style.fontSize = '2rem';
            closeButton.style.color = '#333';

            // Ajoute l'événement de clic pour fermer le modal
            closeButton.addEventListener('click', function () {
                self.closeModal();
            });

            // Création de l'iframe
            var modalIframe = document.createElement('iframe');
            modalIframe.id = 'modalIframe';
            modalIframe.src = ''; // URL dynamique définie lors de l'ouverture
            modalIframe.style.width = '100%';
            modalIframe.style.height = '100%';
            modalIframe.style.border = 'none';

            // Assemblage du modal
            modalContent.appendChild(closeButton);
            modalContent.appendChild(modalIframe);
            overlayModal.appendChild(modalContent);
            document.body.appendChild(overlayModal);

            // Permet de fermer le modal en cliquant en dehors du contenu
            overlayModal.addEventListener('click', function (event) {
                if (event.target === overlayModal) {
                    self.closeModal();
                }
            });
        },

        handleSend: function (inputField) {
            var message = inputField.value.trim();
            if (message === '') return;

            // Stocker le message dans le localStorage
            localStorage.setItem('tempMessage', message);

            // Ouvrir la modale avec l'URL /chat
            this.openModalWithURL('http://upenn.localhost:3001/chat');

            // Réinitialiser le champ de saisie et l'état du widget
            inputField.value = '';
            this.activeButton = null;
            this.questionsContainer.style.display = 'none';
            inputField.placeholder = this.language === 'fr' ? 'What are you looking for?' : 'What are you looking for?';
        },

        handleSendQuestion: function (question) {
            if (!question) return;

            // Stocker la question dans le localStorage
            localStorage.setItem('tempMessage', question);

            // Ouvrir la modale avec l'URL /chat
            this.openModalWithURL('http://upenn.localhost:3001/chat');

            // Réinitialiser le champ de saisie et l'état du widget
            this.inputField.value = '';
            this.activeButton = null;
            this.questionsContainer.style.display = 'none';
            this.inputField.placeholder = this.language === 'fr' ? 'What are you looking for?' : 'What are you looking for?';
        },

        handleButtonMouseEnter: function (buttonLabel, questions) {
            var self = this;
            self.activeButton = buttonLabel;
            self.questionsContainer.innerHTML = '';
            self.questionsContainer.style.display = 'block';

            if (questions && questions.length > 0) {
                questions.forEach(function (question, index) {
                    var questionElement = document.createElement('div');
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

        openModalWithURL: function (url) {
            console.log("Tentative d'ouverture du modal avec l'URL:", url);

            var overlayModal = document.getElementById('overlayModal');
            var modalIframe = document.getElementById('modalIframe');
            var mainContainer = document.querySelector(this.containerSelector);

            if (!overlayModal || !modalIframe) {
                console.error("Erreur: overlayModal ou modalIframe non trouvé dans le DOM.");
                return;
            }

            // Définit la source de l'iframe et affiche le modal
            modalIframe.src = url;
            overlayModal.style.display = 'flex'; // Affiche la modal

            // Masque le widget principal
            if (mainContainer) {
                mainContainer.style.display = 'none';
                console.log("Widget principal masqué.");
            }

            // Stocke l'état du modal dans le sessionStorage
            sessionStorage.setItem('isModalOpen', 'true');
            sessionStorage.setItem('modalURL', url);
        },

        closeModal: function () {
            var overlayModal = document.getElementById('overlayModal');
            var modalIframe = document.getElementById('modalIframe');
            var mainContainer = document.querySelector(this.containerSelector);

            if (overlayModal && modalIframe) {
                overlayModal.style.display = 'none';
                modalIframe.src = '';

                // Réaffiche le widget principal
                if (mainContainer) {
                    mainContainer.style.display = 'block';
                    console.log("Widget principal réaffiché.");
                }

                // Supprime l'état du modal de sessionStorage
                sessionStorage.removeItem('isModalOpen');
                sessionStorage.removeItem('modalURL');
            }
        },

        checkModalState: function () {
            // Vérifie si la modale était ouverte et recharge l'URL si nécessaire
            var isModalOpen = sessionStorage.getItem('isModalOpen');
            var modalURL = sessionStorage.getItem('modalURL');

            if (isModalOpen === 'true' && modalURL) {
                this.openModalWithURL(modalURL);
            }
        }
    };
})();

// Initialisation du widget après le chargement du DOM
document.addEventListener("DOMContentLoaded", function () {
    // Initialisation du widget
    LucyWidget.init({
        container: '#lucy-widget-container',  // Utilisez le bon ID ici
        university: 'University of Pennsylvania',
        theme: 'light',
        language: 'fr'
    });

    console.log("Widget Lucy initialisé.");
});

// Suppression du bouton "Toggle Widget Visibility"
// Aucun code relatif à ce bouton n'est inclus ici

