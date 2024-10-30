
/*
var LucyWidget = {
    init: function (options) {
        console.log("LucyWidget.init called with options:", options);

        // Assure que le conteneur existe
        var container = document.querySelector(options.container);
        if (!container) {
            console.error("Conteneur spécifié introuvable:", options.container);
            return;
        }
        console.log("Conteneur trouvé:", container);

        // Créer un bouton circulaire avec une icône à l'intérieur
        var button = document.createElement('button');
        button.innerHTML = '<img src="/upenn_icon.png" alt="Lucy Icon" style="width: 30px; height: 30px; border-radius: 50%;">'; // Remplace par le chemin réel de l'icône de UPenn
        button.style.position = 'fixed';
        button.style.bottom = '60px';
        button.style.right = '20px';
        button.style.width = '60px';
        button.style.height = '60px';
        button.style.backgroundColor = '#011F5B'; // Bleu de UPenn
        button.style.color = '#fff';
        button.style.border = 'none';
        button.style.borderRadius = '50%'; // Bouton circulaire
        button.style.cursor = 'pointer';
        button.style.zIndex = '1000';

        document.body.appendChild(button);
        console.log("'Lucy' bouton circulaire ajouté au DOM.");

        // Afficher/masquer le widget au clic du bouton
        button.addEventListener('click', function () {
            if (container.style.display === 'none') {
                container.style.display = 'block';
                console.log("Widget affiché.");
            } else {
                container.style.display = 'none';
                console.log("Widget masqué.");
            }
        });

        // Appliquer les styles au conteneur (boîte du widget)
        container.style.position = 'fixed';
        container.style.bottom = '100px';
        container.style.right = '20px';
        container.style.width = '350px';
        container.style.height = '450px'; // Hauteur ajustée pour de bonnes proportions
        container.style.backgroundColor = '#ffffff';
        container.style.border = '1px solid #ccc';
        container.style.borderRadius = '10px';
        container.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.2)';
        container.style.display = 'none'; // Initialement masqué
        container.style.zIndex = '1000';
        container.style.overflow = 'hidden';

        console.log("Styles du widget appliqués au conteneur.");

        // Initialiser l'interface de chat
        this.createChatInterface(container);
    },

    createChatInterface: function (container) {
        // Créer l'en-tête du widget de chat
        var header = document.createElement('div');
        header.style.backgroundColor = '#011F5B'; // Bleu de UPenn
        header.style.color = '#fff';
        header.style.padding = '10px';
        header.style.textAlign = 'center';
        header.style.fontWeight = 'bold';
        header.innerHTML = 'Chat avec Lucy';

        container.appendChild(header);

        // Créer la zone de chat (zone d'affichage des messages)
        var chatArea = document.createElement('div');
        chatArea.style.flex = '1';
        chatArea.style.overflowY = 'auto';
        chatArea.style.padding = '10px';
        chatArea.style.backgroundColor = '#f4f4f4';
        chatArea.style.height = '320px';
        chatArea.id = 'chat-area';

        // Afficher un message initial si aucun message
        var initialMessage = document.createElement('div');
        initialMessage.style.textAlign = 'center';
        initialMessage.style.color = '#011F5B'; // Bleu de UPenn
        initialMessage.style.fontSize = '1.2rem';
        initialMessage.style.marginTop = '20px';
        initialMessage.innerHTML = 'Comment puis-je vous aider aujourd\'hui ?';
        chatArea.appendChild(initialMessage);

        container.appendChild(chatArea);

        // Créer la zone d'entrée (champ de texte et bouton d'envoi)
        var inputArea = document.createElement('div');
        inputArea.style.display = 'flex';
        inputArea.style.padding = '10px';

        var inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.placeholder = 'Demandez à Lucy...';
        inputField.style.flex = '1';
        inputField.style.padding = '10px';
        inputField.style.borderRadius = '5px';
        inputField.style.border = '1px solid #ccc';
        inputField.style.marginRight = '10px';
        inputField.style.fontSize = '0.9rem';

        var sendButton = document.createElement('button');
        sendButton.innerHTML = 'Envoyer';
        sendButton.style.backgroundColor = '#990000'; // Rouge de UPenn
        sendButton.style.color = '#fff';
        sendButton.style.border = 'none';
        sendButton.style.borderRadius = '5px';
        sendButton.style.padding = '10px';
        sendButton.style.cursor = 'pointer';

        // Ajouter le champ de texte et le bouton à la zone d'entrée
        inputArea.appendChild(inputField);
        inputArea.appendChild(sendButton);

        container.appendChild(inputArea);

        // Gérer l'envoi des messages
        var self = this;
        sendButton.addEventListener('click', function () {
            self.sendMessage(chatArea, inputField, initialMessage);
        });

        // Gérer l'envoi des messages via la touche Entrée
        inputField.addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                self.sendMessage(chatArea, inputField, initialMessage);
            }
        });
    },

    sendMessage: function (chatArea, inputField, initialMessage) {
        var message = inputField.value.trim();
        if (message === '') return;

        // Supprimer le message initial lorsqu'un message est envoyé
        if (initialMessage) {
            chatArea.removeChild(initialMessage);
        }

        // Afficher le message de l'utilisateur
        this.displayUserMessage(chatArea, message);

        inputField.value = ''; // Vider le champ de texte

        // Simuler Lucy en train de taper (trois points) avant de répondre
        this.displayThreeDots(chatArea);

        // Attendre 2 secondes avant de remplacer les points par la réponse de Lucy
        setTimeout(() => {
            this.removeThreeDots(chatArea);
            this.displayLucyMessage(chatArea, "Bonjour ! Je suis ici pour vous aider.");
        }, 2000);
    },

    displayUserMessage: function (chatArea, message) {
        var userMessageContainer = document.createElement('div');
        userMessageContainer.style.textAlign = 'right'; // Aligné à droite
        userMessageContainer.style.padding = '5px';
        userMessageContainer.style.marginBottom = '10px';

        var userMessageBubble = document.createElement('div');
        userMessageBubble.style.backgroundColor = '#EAEAEA'; // Fond clair pour le message utilisateur
        userMessageBubble.style.color = '#000';
        userMessageBubble.style.padding = '10px';
        userMessageBubble.style.borderRadius = '10px';
        userMessageBubble.style.display = 'inline-block';
        userMessageBubble.style.maxWidth = '100%'; // Largeur maximale
        userMessageBubble.innerHTML = message;

        // Ajouter la bulle de message à son conteneur
        userMessageContainer.appendChild(userMessageBubble);

        // Ajouter le message de l'utilisateur à la zone de chat
        chatArea.appendChild(userMessageContainer);

        // Faire défiler jusqu'en bas
        chatArea.scrollTop = chatArea.scrollHeight;
    },

    displayThreeDots: function (chatArea) {
        var dotsContainer = document.createElement('div');
        dotsContainer.id = 'lucy-dots';
        dotsContainer.style.textAlign = 'left'; // Aligné à gauche (là où Lucy répondra)
        dotsContainer.style.padding = '5px';
        dotsContainer.style.marginBottom = '10px';
        dotsContainer.innerHTML = '...'; // Simule les trois points

        // Ajouter les points à la zone de chat
        chatArea.appendChild(dotsContainer);
        chatArea.scrollTop = chatArea.scrollHeight;
    },

    removeThreeDots: function (chatArea) {
        var dots = document.getElementById('lucy-dots');
        if (dots) {
            chatArea.removeChild(dots);
        }
    },

    displayLucyMessage: function (chatArea, message) {
        var lucyMessageContainer = document.createElement('div');
        lucyMessageContainer.style.textAlign = 'left'; // Aligné à gauche
        lucyMessageContainer.style.padding = '5px';
        lucyMessageContainer.style.marginBottom = '10px';

        var lucyMessageBubble = document.createElement('div');
        lucyMessageBubble.style.backgroundColor = '#F0F0F0'; // Gris clair pour le message de Lucy
        lucyMessageBubble.style.color = '#000';
        lucyMessageBubble.style.padding = '10px';
        lucyMessageBubble.style.borderRadius = '10px';
        lucyMessageBubble.style.display = 'inline-block';
        lucyMessageBubble.style.maxWidth = '100%'; // Largeur maximale
        lucyMessageBubble.innerHTML = message;

        // Ajouter la bulle de message à son conteneur
        lucyMessageContainer.appendChild(lucyMessageBubble);

        // Ajouter le message de Lucy à la zone de chat
        chatArea.appendChild(lucyMessageContainer);

        // Faire défiler jusqu'en bas
        chatArea.scrollTop = chatArea.scrollHeight;
    }
};

// Exporter LucyWidget pour être accessible globalement
window.LucyWidget = LucyWidget;
*/




// NOUVELLE VERSION EN COPIANT LES AUTRES
/*
var LucyWidget = {
    init: function (options) {
        console.log("LucyWidget.init called with options:", options);

        // Ensure the container exists
        var container = document.querySelector(options.container);
        if (!container) {
            console.error("Specified container not found:", options.container);
            return;
        }
        console.log("Container found:", container);

        // Create a circular button with an icon inside
        var button = document.createElement('button');
        button.innerHTML = '<img src="/upenn_icon.png" alt="Lucy Icon" style="width: 30px; height: 30px; border-radius: 50%;">'; // Replace with actual UPenn icon path
        button.style.position = 'fixed';
        button.style.bottom = '60px';
        button.style.right = '20px';
        button.style.width = '60px';
        button.style.height = '60px';
        button.style.backgroundColor = '#011F5B'; // UPenn blue
        button.style.color = '#fff';
        button.style.border = 'none';
        button.style.borderRadius = '50%'; // Circular button
        button.style.cursor = 'pointer';
        button.style.zIndex = '1000';

        document.body.appendChild(button);
        console.log("'Lucy' circular button added to the DOM.");

        // Show/hide the widget when clicking the button
        button.addEventListener('click', function () {
            if (container.style.display === 'none') {
                container.style.display = 'block';
                console.log("Widget displayed.");
            } else {
                container.style.display = 'none';
                console.log("Widget hidden.");
            }
        });

        // Apply styles to the container (widget box)
        container.style.position = 'fixed';
        container.style.bottom = '100px';
        container.style.right = '20px';
        container.style.width = '350px';
        container.style.height = '450px'; // Adjusted height for proportions
        container.style.backgroundColor = '#ffffff';
        container.style.border = '1px solid #ccc';
        container.style.borderRadius = '10px';
        container.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.2)';
        container.style.display = 'none'; // Initially hidden
        container.style.zIndex = '1000';
        container.style.overflow = 'hidden';

        console.log("Widget styles applied to container.");

        // Initialize the chat interface
        this.createChatInterface(container);
    },

    createChatInterface: function (container) {
        // Create the header of the chat widget
        var header = document.createElement('div');
        header.style.backgroundColor = '#011F5B'; // UPenn blue
        header.style.color = '#fff';
        header.style.padding = '10px';
        header.style.textAlign = 'center';
        header.style.fontWeight = 'bold';
        header.innerHTML = 'Chat with Lucy';

        container.appendChild(header);

        // Create the chat area (message display area)
        var chatArea = document.createElement('div');
        chatArea.style.flex = '1';
        chatArea.style.overflowY = 'auto';
        chatArea.style.padding = '10px';
        chatArea.style.backgroundColor = '#f4f4f4';
        chatArea.style.height = '320px';
        chatArea.id = 'chat-area';

        // Display initial prompt if no messages
        var initialMessage = document.createElement('div');
        initialMessage.style.textAlign = 'center';
        initialMessage.style.color = '#011F5B'; // UPenn blue
        initialMessage.style.fontSize = '1.2rem';
        initialMessage.style.marginTop = '20px';
        initialMessage.innerHTML = 'How can I help you today?';
        chatArea.appendChild(initialMessage);

        container.appendChild(chatArea);

        // Create the input area (text field and send button)
        var inputArea = document.createElement('div');
        inputArea.style.display = 'flex';
        inputArea.style.padding = '10px';

        var inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.placeholder = 'Ask Lucy...';
        inputField.style.flex = '1';
        inputField.style.padding = '10px';
        inputField.style.borderRadius = '5px';
        inputField.style.border = '1px solid #ccc';
        inputField.style.marginRight = '10px';
        inputField.style.fontSize = '0.9rem';

        var sendButton = document.createElement('button');
        sendButton.innerHTML = 'Send';
        sendButton.style.backgroundColor = '#990000'; // UPenn red
        sendButton.style.color = '#fff';
        sendButton.style.border = 'none';
        sendButton.style.borderRadius = '5px';
        sendButton.style.padding = '10px';
        sendButton.style.cursor = 'pointer';

        // Append input and button to input area
        inputArea.appendChild(inputField);
        inputArea.appendChild(sendButton);

        container.appendChild(inputArea);

        // Handle message sending
        var self = this;
        sendButton.addEventListener('click', function () {
            self.sendMessage(chatArea, inputField, initialMessage);
        });

        // Handle sending messages via Enter key
        inputField.addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                self.sendMessage(chatArea, inputField, initialMessage);
            }
        });
    },

    sendMessage: function (chatArea, inputField, initialMessage) {
        var message = inputField.value.trim();
        if (message === '') return;

        // Remove initial message when a message is sent
        if (initialMessage) {
            chatArea.removeChild(initialMessage);
        }

        // Display the user's message
        this.displayUserMessage(chatArea, message);

        inputField.value = ''; // Clear input field

        // Simulate Lucy typing (Three Dots) before responding
        this.displayThreeDots(chatArea);

        // Wait 2 seconds before replacing dots with Lucy's response
        setTimeout(() => {
            this.removeThreeDots(chatArea);
            this.displayLucyMessage(chatArea, "Hi Mathieu! I’m here to help you understand what’s next.");
        }, 2000);
    },

    displayUserMessage: function (chatArea, message) {
        var userMessageContainer = document.createElement('div');
        userMessageContainer.style.textAlign = 'right'; // Aligned to the right
        userMessageContainer.style.padding = '5px';
        userMessageContainer.style.marginBottom = '10px';

        var userMessageBubble = document.createElement('div');
        userMessageBubble.style.backgroundColor = '#EAEAEA'; // Light background for user message
        userMessageBubble.style.color = '#000';
        userMessageBubble.style.padding = '10px';
        userMessageBubble.style.borderRadius = '10px';
        userMessageBubble.style.display = 'inline-block';
        userMessageBubble.style.maxWidth = '100%'; // Full width
        userMessageBubble.innerHTML = message;

        // Append the message bubble to the container
        userMessageContainer.appendChild(userMessageBubble);

        // Append user message to the chat area
        chatArea.appendChild(userMessageContainer);

        // Scroll to the bottom
        chatArea.scrollTop = chatArea.scrollHeight;
    },

    displayThreeDots: function (chatArea) {
        var dotsContainer = document.createElement('div');
        dotsContainer.id = 'lucy-dots';
        dotsContainer.style.textAlign = 'left'; // Aligned to the left (where Lucy will respond)
        dotsContainer.style.padding = '5px';
        dotsContainer.style.marginBottom = '10px';
        dotsContainer.innerHTML = '...'; // This will simulate the three dots

        // Append dots to the chat area
        chatArea.appendChild(dotsContainer);
        chatArea.scrollTop = chatArea.scrollHeight;
    },

    removeThreeDots: function (chatArea) {
        var dots = document.getElementById('lucy-dots');
        if (dots) {
            chatArea.removeChild(dots);
        }
    },

    displayLucyMessage: function (chatArea, message) {
        var lucyMessageContainer = document.createElement('div');
        lucyMessageContainer.style.textAlign = 'left'; // Aligned to the left
        lucyMessageContainer.style.padding = '5px';
        lucyMessageContainer.style.marginBottom = '10px';

        var lucyMessageBubble = document.createElement('div');
        lucyMessageBubble.style.backgroundColor = '#F0F0F0'; // Light gray for Lucy message
        lucyMessageBubble.style.color = '#000';
        lucyMessageBubble.style.padding = '10px';
        lucyMessageBubble.style.borderRadius = '10px';
        lucyMessageBubble.style.display = 'inline-block';
        lucyMessageBubble.style.maxWidth = '100%'; // Full width
        lucyMessageBubble.innerHTML = message;

        // Append message bubble to the container
        lucyMessageContainer.appendChild(lucyMessageBubble);

        // Append Lucy's message to the chat area
        chatArea.appendChild(lucyMessageContainer);

        // Scroll to the bottom
        chatArea.scrollTop = chatArea.scrollHeight;
    }
};

// Export LucyWidget to be accessible globally
window.LucyWidget = LucyWidget;
*/


var LucyWidget = {
    init: function (options) {
        console.log("LucyWidget.init called with options:", options);

        // Ensure the container exists
        var container = document.querySelector(options.container);
        if (!container) {
            console.error("Specified container not found:", options.container);
            return;
        }
        console.log("Container found:", container);

        // Create a circular button with a chat icon
        var button = document.createElement('button');
        button.innerHTML = '<img src="http://localhost:3001/logos/upenn_logo.png" alt="Chat Icon" style="width: 55px; height: auto; border-radius: 50%;">'; // Replace with actual chat icon path
        button.style.position = 'fixed';
        button.style.bottom = '30px';
        button.style.right = '30px';
        button.style.width = '60px';
        button.style.height = '60px';
        button.style.backgroundColor = '#B22222'; // UPenn red
        button.style.color = '#fff';
        button.style.border = 'none';
        button.style.borderRadius = '50%'; // Circular button
        button.style.cursor = 'pointer';
        button.style.zIndex = '1000';

        document.body.appendChild(button);
        console.log("'Chat with Lucy' button added to the DOM.");

        // Show/hide the widget when clicking the button
        button.addEventListener('click', function () {
            if (container.style.display === 'none') {
                container.style.display = 'block';
                console.log("Widget displayed.");
            } else {
                container.style.display = 'none';
                console.log("Widget hidden.");
            }
        });

        // Apply styles to the container (widget box)
        container.style.position = 'fixed';
        container.style.bottom = '100px';
        container.style.right = '20px';
        container.style.width = '390px';
        container.style.height = '700px'; // Reduced height for proportions
        container.style.backgroundColor = '#ffffff';
        container.style.border = '1px solid #ccc';
        container.style.borderRadius = '5px';
        container.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.2)';
        container.style.display = 'none'; // Initially hidden
        container.style.zIndex = '1000';
        container.style.overflow = 'hidden';

        console.log("Widget styles applied to container.");

        // Initialize the chat interface
        this.createChatInterface(container);
    },

    createChatInterface: function (container) {
        // Create the header of the chat widget
        var header = document.createElement('div');
        header.style.backgroundColor = '#1A3D7C'; // UPenn blue
        header.style.color = '#fff';
        header.style.padding = '15px';
        header.style.display = 'flex';
        header.style.justifyContent = 'flex-end'; // Align items to the right
        header.style.alignItems = 'center';

        // Lucy Title - Aligned to the left
        var title = document.createElement('div');
        title.style.fontWeight = 'bold';
        title.style.flex = '1'; // Takes up available space to the left
        title.innerHTML = 'Lucy';
        title.style.fontSize = '1.1rem'; // Increase title font size
        header.appendChild(title);

        // Create a button-like link (anchor element)
        var infoButton = document.createElement('a');
        infoButton.href = 'http://upenn.localhost:3001'; // Replace with actual URL
        infoButton.innerHTML = 'Fullscreen'; // Display text
        infoButton.style.textDecoration = 'none'; // Remove underline
        infoButton.style.color = '#fff'; // Text color
        infoButton.style.padding = '8px 15px'; // Padding for button-like appearance
        infoButton.style.backgroundColor = '#B22222'; // UPenn red background
        infoButton.style.borderRadius = '5px'; // Rounded corners
        infoButton.style.cursor = 'pointer'; // Pointer cursor
        infoButton.style.marginRight = '10px'; // Space between button and close icon
        infoButton.style.display = 'inline-block'; // Inline-block for button appearance

        // Append the button to header before close button
        header.appendChild(infoButton);

        container.appendChild(header);

        // Create the chat area (message display area)
        var chatArea = document.createElement('div');
        chatArea.style.flex = '1';
        chatArea.style.overflowY = 'auto';
        chatArea.style.padding = '10px';
        chatArea.style.backgroundColor = '#ffffff'; // Light background for chat area
        chatArea.style.height = '600px'; // Adjusted height
        chatArea.id = 'chat-area';

        container.appendChild(chatArea);

        // Display the initial AI message
        this.displayLucyMessage(chatArea, "Hey! I’m Lucy, your AI Penn guide. How can I help?", null);

        // Create the input area (text field and send button)
        var inputArea = document.createElement('div');
        inputArea.style.display = 'flex';
        inputArea.style.padding = '20px';
        inputArea.style.position = 'absolute';
        inputArea.style.bottom = '0';
        inputArea.style.width = '100%';
        inputArea.style.backgroundColor = '#fff';
        inputArea.style.borderTop = '1px solid #ccc';

        var inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.placeholder = 'Ask Lucy...';
        inputField.style.flex = '1';
        inputField.style.padding = '8px';
        inputField.style.borderRadius = '15px'; // More rounded input
        inputField.style.border = '1px solid #ccc';
        inputField.style.marginRight = '10px';
        inputField.style.fontSize = '1rem';

        var sendButton = document.createElement('button');
        sendButton.innerHTML = 'Send';
        sendButton.style.backgroundColor = '#B22222'; // UPenn red
        sendButton.style.color = '#fff';
        sendButton.style.border = 'none';
        sendButton.style.borderRadius = '15px'; // Circular send button
        sendButton.style.padding = '10px';
        sendButton.style.width = 'auto';
        sendButton.style.height = '40px';
        sendButton.style.cursor = 'pointer';

        // Append input and button to input area
        inputArea.appendChild(inputField);
        inputArea.appendChild(sendButton);

        container.appendChild(inputArea);

        // Handle message sending
        var self = this;
        sendButton.addEventListener('click', function () {
            self.sendMessage(chatArea, inputField);
        });

        // Handle sending messages via Enter key
        inputField.addEventListener('keypress', function (event) {
            if (event.key === 'Enter') {
                self.sendMessage(chatArea, inputField);
            }
        });
    },

    sendMessage: function (chatArea, inputField) {
        var message = inputField.value.trim();
        if (message === '') return;

        // Display the user's message
        this.displayUserMessage(chatArea, message);
        inputField.value = ''; // Clear input field

        // Display Lucy typing indicator
        this.displayThreeDots(chatArea);

        // Simulate response delay
        setTimeout(() => {
            this.removeThreeDots(chatArea);
            this.displayLucyMessage(chatArea, "Sure! I’m here to help you with anything you need.", [
                { text: 'Source 1', url: 'https://example.com/source1' },
                { text: 'Source 2', url: 'https://example.com/source2' }
            ]);
        }, 2000);
    },

    displayUserMessage: function (chatArea, message) {
        var userMessageContainer = document.createElement('div');
        userMessageContainer.style.textAlign = 'right';
        userMessageContainer.style.marginBottom = '10px';
        userMessageContainer.style.display = 'flex';
        userMessageContainer.style.justifyContent = 'flex-end';
        userMessageContainer.style.paddingRight = '15px';

        var userMessageBubble = document.createElement('div');
        userMessageBubble.style.backgroundColor = '#EAF2F8'; // Light blue for user messages
        userMessageBubble.style.color = '#000';
        userMessageBubble.style.padding = '15px';
        userMessageBubble.style.borderRadius = '15px';
        userMessageBubble.style.maxWidth = '80%';
        userMessageBubble.style.textAlign = 'left';
        userMessageBubble.innerHTML = message;

        userMessageContainer.appendChild(userMessageBubble);
        chatArea.appendChild(userMessageContainer);

        chatArea.scrollTop = chatArea.scrollHeight;
    },

    displayThreeDots: function (chatArea) {
        var dotsContainer = document.createElement('div');
        dotsContainer.id = 'lucy-dots';
        dotsContainer.style.textAlign = 'left';
        dotsContainer.style.padding = '5px';
        dotsContainer.style.marginBottom = '10px';
        dotsContainer.innerHTML = '...';

        chatArea.appendChild(dotsContainer);
        chatArea.scrollTop = chatArea.scrollHeight;
    },

    removeThreeDots: function (chatArea) {
        var dots = document.getElementById('lucy-dots');
        if (dots) {
            chatArea.removeChild(dots);
        }
    },

    displayLucyMessage: function (chatArea, message, sources) {
        var lucyMessageContainer = document.createElement('div');
        lucyMessageContainer.style.display = 'flex';
        lucyMessageContainer.style.alignItems = 'center';
        lucyMessageContainer.style.marginBottom = '10px';
        lucyMessageContainer.style.marginTop = '20px';
        lucyMessageContainer.style.paddingLeft = '5px';

        var logo = document.createElement('img');
        logo.src = 'http://localhost:3001/logos/upenn_logo.png';
        logo.alt = 'University Logo';
        logo.style.width = '50px';
        logo.style.height = 'auto';
        logo.style.marginRight = '5px';
        lucyMessageContainer.appendChild(logo);

        var lucyResponseContainer = document.createElement('div');
        lucyResponseContainer.style.backgroundColor = '#F7F7F7';
        lucyResponseContainer.style.padding = '10px';
        lucyResponseContainer.style.borderRadius = '10px';
        lucyResponseContainer.style.maxWidth = '80%';

        var lucyResponse = document.createElement('div');
        lucyResponse.style.color = '#011F5B';
        lucyResponse.style.fontSize = '1rem';
        lucyResponse.style.textAlign = 'left';
        lucyResponse.innerHTML = message;

        lucyResponseContainer.appendChild(lucyResponse);

        // Append source buttons if sources are provided
        if (sources && sources.length > 0) {
            var sourceContainer = document.createElement('div');
            sourceContainer.style.marginTop = '10px';
            
            sources.forEach(source => {
                var sourceButton = document.createElement('a');
                sourceButton.href = source.url;
                sourceButton.target = '_blank';
                sourceButton.innerHTML = source.text;
                sourceButton.style.display = 'inline-block';
                sourceButton.style.marginRight = '10px';
                sourceButton.style.padding = '8px 12px';
                sourceButton.style.backgroundColor = '#B22222';
                sourceButton.style.color = '#fff';
                sourceButton.style.borderRadius = '5px';
                sourceButton.style.textDecoration = 'none';
                sourceButton.style.cursor = 'pointer';
                
                sourceContainer.appendChild(sourceButton);
            });

            lucyResponseContainer.appendChild(sourceContainer);
        }

        lucyMessageContainer.appendChild(lucyResponseContainer);
        chatArea.appendChild(lucyMessageContainer);

        chatArea.scrollTop = chatArea.scrollHeight;
    }
};

// Export LucyWidget to be accessible globally
window.LucyWidget = LucyWidget;


       


/*
var LucyWidget = {
    init: function(options) {
        console.log("LucyWidget.init called with options:", options);

        // Ensure the container exists
        var container = document.querySelector(options.container);
        if (!container) {
            console.error("Specified container not found:", options.container);
            return;
        }
        console.log("Container found:", container);

        // Create a button for opening/closing the widget
        var button = document.createElement('button');
        button.innerHTML = 'Chat avec Lucy';
        button.style.position = 'fixed';
        button.style.bottom = '20px';
        button.style.right = '20px';
        button.style.padding = '10px 20px';
        button.style.backgroundColor = '#007BFF';
        button.style.color = '#fff';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.zIndex = '1000';

        document.body.appendChild(button);
        console.log("'Chat avec Lucy' button added to the DOM.");

        // Show/hide the widget when clicking the button
        button.addEventListener('click', function() {
            if (container.style.display === 'none') {
                container.style.display = 'block';
                console.log("Widget displayed.");
            } else {
                container.style.display = 'none';
                console.log("Widget hidden.");
            }
        });

        // Apply styles to the container (widget box)
        container.style.position = 'fixed';
        container.style.bottom = '80px';
        container.style.right = '20px';
        container.style.width = '300px';
        container.style.height = '400px';
        container.style.backgroundColor = '#ffffff';
        container.style.border = '1px solid #ccc';
        container.style.borderRadius = '10px';
        container.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.2)';
        container.style.display = 'none'; // Initially hidden
        container.style.zIndex = '1000';

        console.log("Widget styles applied to container.");

        // Initialize the chat widget
        this.loadChat(container);
    },

    loadChat: function(container) {
        // Create a script tag to load the compiled React app
        var script = document.createElement('script');
        script.src = 'chat-widget.js'; // Ensure this path is correct
        script.onload = function() {
            // After the script is loaded, render the React component
            if (window.ChatWidget && window.ChatWidget.render) {
                window.ChatWidget.render(container);
                console.log("React chat component loaded inside widget.");
            } else {
                console.error("Failed to load ChatWidget component.");
            }
        };
        document.head.appendChild(script);
    }
};

// Export LucyWidget to be accessible globally
window.LucyWidget = LucyWidget;
*/



/*
var LucyWidget = {
    init: function(options) {
        console.log("LucyWidget.init a été appelé avec les options :", options);

        // Vérifier si le conteneur existe
        var container = document.querySelector(options.container);
        if (!container) {
            console.error("Le conteneur spécifié n'a pas été trouvé :", options.container);
            return;
        }
        console.log("Conteneur trouvé :", container);

        // Appliquer les styles au conteneur
        container.style.position = 'fixed';
        container.style.bottom = '80px'; // Ajusté pour ne pas chevaucher le bouton
        container.style.right = '20px';
        container.style.width = '300px';
        container.style.height = '400px';
        container.style.backgroundColor = '#ffffff';
        container.style.border = '1px solid #ccc';
        container.style.borderRadius = '10px';
        container.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.2)';
        container.style.display = 'none'; // Le widget sera caché au départ
        container.style.zIndex = '1000';
        console.log("Styles appliqués au conteneur.");

        // Créer un bouton pour ouvrir/fermer le widget
        var button = document.createElement('button');
        button.innerHTML = 'Chat avec Lucy';
        button.style.position = 'fixed';
        button.style.bottom = '20px';
        button.style.right = '20px';
        button.style.padding = '10px 20px';
        button.style.backgroundColor = '#007BFF';
        button.style.color = '#fff';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.zIndex = '1000';

        document.body.appendChild(button);
        console.log("Bouton 'Chat avec Lucy' ajouté au DOM.");

        // Fonction pour afficher/masquer le widget
        button.addEventListener('click', function() {
            if (container.style.display === 'none') {
                container.style.display = 'block';
                console.log("Widget affiché.");
            } else {
                container.style.display = 'none';
                console.log("Widget masqué.");
            }
        });

        // Initialisation du contenu du widget
        // Nettoyer le conteneur
        container.innerHTML = '';

        // Créer l'élément de la zone de messages
        var messagesContainer = document.createElement('div');
        messagesContainer.style.height = 'calc(100% - 60px)';
        messagesContainer.style.overflowY = 'auto';
        messagesContainer.style.padding = '10px';

        // Créer l'élément du champ de saisie
        var inputContainer = document.createElement('div');
        inputContainer.style.position = 'absolute';
        inputContainer.style.bottom = '0';
        inputContainer.style.width = '100%';
        inputContainer.style.boxSizing = 'border-box';
        inputContainer.style.display = 'flex';
        inputContainer.style.alignItems = 'center';
        inputContainer.style.padding = '5px';

        var inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.placeholder = 'Tapez votre message...';
        inputField.style.flex = '1';
        inputField.style.padding = '8px';
        inputField.style.border = '1px solid #ccc';
        inputField.style.borderRadius = '5px';

        var sendButton = document.createElement('button');
        sendButton.innerHTML = 'Envoyer';
        sendButton.style.marginLeft = '5px';
        sendButton.style.padding = '8px 12px';
        sendButton.style.backgroundColor = '#007BFF';
        sendButton.style.color = '#fff';
        sendButton.style.border = 'none';
        sendButton.style.borderRadius = '5px';
        sendButton.style.cursor = 'pointer';

        inputContainer.appendChild(inputField);
        inputContainer.appendChild(sendButton);

        // Ajouter les éléments au conteneur
        container.appendChild(messagesContainer);
        container.appendChild(inputContainer);

        // Fonction pour ajouter un message au conteneur de messages
        function addMessage(sender, text) {
            var messageBubble = document.createElement('div');
            messageBubble.style.margin = '5px 0';
            messageBubble.style.padding = '8px 12px';
            messageBubble.style.borderRadius = '10px';
            messageBubble.style.maxWidth = '80%';
            messageBubble.style.wordWrap = 'break-word';

            if (sender === 'user') {
                messageBubble.style.backgroundColor = '#007BFF';
                messageBubble.style.color = '#fff';
                messageBubble.style.marginLeft = 'auto';
                messageBubble.style.textAlign = 'right';
            } else {
                messageBubble.style.backgroundColor = '#f1f0f0';
                messageBubble.style.color = '#000';
                messageBubble.style.marginRight = 'auto';
                messageBubble.style.textAlign = 'left';
            }

            messageBubble.textContent = text;
            messagesContainer.appendChild(messageBubble);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        // Gérer l'envoi du message
        function sendMessage() {
            var message = inputField.value.trim();
            if (message === '') return;

            addMessage('user', message);
            inputField.value = '';

            // Simuler une réponse de Lucy (à remplacer par votre logique)
            setTimeout(function() {
                var aiResponse = "Lucy: " + getAIResponse(message);
                addMessage('ai', aiResponse);
            }, 1000);
        }

        sendButton.addEventListener('click', sendMessage);
        inputField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
                e.preventDefault();
            }
        });

        // Fonction simulant une réponse de l'IA (à personnaliser)
        function getAIResponse(userMessage) {
            // Ici, vous pouvez intégrer votre logique de chat réelle
            // Par exemple, appeler une API ou une fonction interne

            // Pour l'exemple, nous retournons une réponse simple
            return "Je suis Lucy, votre assistante. Vous avez dit : " + userMessage;
        }

        console.log("Chat initialisé dans le widget.");
    }
};

console.log("LucyWidget script chargé.");

*/