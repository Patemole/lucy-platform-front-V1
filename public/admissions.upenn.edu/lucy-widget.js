
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




//WIDGET UTILISE PDT LA DEMO
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

*/

/* CODE WIDGET AVEC LES CONTOURS QUI NE SONT PLUS DE COULEURS 
var LucyWidget = {
    init: function () {
        // Création du conteneur principal
        var container = document.createElement('div');
        container.id = 'lucy-widget-container';

        // Style du conteneur principal
        container.style.position = 'fixed';
        container.style.bottom = '60px'; // Distance du bas de la page
        container.style.left = '50%';
        container.style.transform = 'translateX(-50%)';
        container.style.width = '90%'; // Largeur du conteneur
        container.style.maxWidth = '820px'; // Largeur maximale du conteneur
        container.style.zIndex = '1000';
        container.style.borderRadius = '12px';
        container.style.overflow = 'hidden';
        container.style.padding = '4px'; // Espace pour le contour animé
        // Suppression de la propriété background pour enlever le dégradé coloré
        // container.style.background = 'linear-gradient(45deg, #FF7E5F, #6A11CB, #FF7E5F)';
        container.style.backgroundSize = '400% 400%';
        container.style.animation = 'gradientAnimation 5s ease infinite';
        container.style.transition = 'box-shadow 0.3s ease, animation-duration 0.3s ease';

        // Création du conteneur interne pour le contenu
        var innerContainer = document.createElement('div');
        innerContainer.style.position = 'relative';
        innerContainer.style.backgroundColor = '#FFFFFF';
        innerContainer.style.borderRadius = '10px'; // Léger arrondi pour correspondre au conteneur principal
        innerContainer.style.padding = '10px 10px';
        innerContainer.style.boxSizing = 'border-box';

        // Ajout du conteneur interne au conteneur principal
        container.appendChild(innerContainer);

        // Ajout du conteneur principal au corps du document
        document.body.appendChild(container);

        // Définition des keyframes pour l'animation du dégradé
        var style = document.createElement('style');
        style.innerHTML = `
            @keyframes gradientAnimation {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            /* Effet au survol *
            #lucy-widget-container:hover {
                animation-duration: 0.3s; /* Accélère l'animation *
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.7); /* Ombre portée renforcée *
            }
        `;
        document.head.appendChild(style);

        // Initialisation de l'interface utilisateur
        this.createInterface(innerContainer);
    },

    createInterface: function (container) {
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
        inputField.placeholder = 'How can I help you today?'; // Placeholder
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
        sendButton.style.background = 'none';
        sendButton.style.cursor = 'pointer';
        inputContainer.appendChild(sendButton);

        // Gestion du clic sur le bouton d'envoi
        sendButton.addEventListener('click', function() {
            self.handleSend(inputField);
        });

        // Gestion de la touche Entrée
        inputField.addEventListener('keypress', function(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                self.handleSend(inputField);
            }
        });

        // Création des boutons d'options
        var buttonsContainer = document.createElement('div');
        buttonsContainer.style.width = '100%';
        buttonsContainer.style.marginTop = '10px'; // Marge supérieure des boutons
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.flexWrap = 'wrap';
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
        buttons.forEach(function(buttonData) {
            var button = document.createElement('button');
            button.innerHTML = buttonData.icon + ' ' + buttonData.label;
            button.style.border = '1px solid #BCBCBC'; // Bordure neutre
            // Suppression de la propriété color
            // button.style.color = '#011F5B';
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

            // Effets au survol des boutons
            button.addEventListener('mouseenter', function() {
                self.handleButtonMouseEnter(buttonData.label, questionsMap[buttonData.label]);
                // Suppression des changements de couleur au survol
                // button.style.backgroundColor = '#011F5B';
                // button.style.color = '#FFFFFF';
            });

            button.addEventListener('mouseleave', function() {
                // button.style.backgroundColor = 'transparent';
                // button.style.color = '#011F5B';
            });

            buttonsContainer.appendChild(button);
        });

        // Conteneur pour les suggestions de questions
        self.questionsContainer = document.createElement('div');
        self.questionsContainer.style.width = '100%';
        self.questionsContainer.style.maxWidth = '800px';
        self.questionsContainer.style.backgroundColor = '#FFFFFF';
        self.questionsContainer.style.border = '1px solid #BCBCBC';
        self.questionsContainer.style.borderRadius = '8px';
        self.questionsContainer.style.padding = '20px';
        self.questionsContainer.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        self.questionsContainer.style.marginTop = '10px';
        self.questionsContainer.style.display = 'none';
        container.appendChild(self.questionsContainer);

        self.activeButton = null;
        self.isHoveringQuestions = false;

        // Gestion du clic en dehors du widget
        document.addEventListener('mousedown', function(event) {
            var target = event.target;
            if (!container.contains(target) && !self.isHoveringQuestions) {
                self.activeButton = null;
                self.questionsContainer.style.display = 'none';
                inputField.value = '';
                inputField.placeholder = 'How can I help you today?';
            }
        });

        // Gestion des changements dans le champ de saisie
        self.inputField.addEventListener('input', function() {
            if (self.inputField.value.trim() === '') {
                self.activeButton = null;
                self.questionsContainer.style.display = 'none';
            }
        });
    },

    handleSend: function(inputField) {
        var message = inputField.value.trim();
        if (message === '') return;

        // Traitement de l'envoi du message
        console.log('Message sent:', message);
        inputField.value = '';
        this.activeButton = null;
        this.questionsContainer.style.display = 'none';
        inputField.placeholder = 'How can I help you today?';
    },

    handleButtonMouseEnter: function(buttonLabel, questions) {
        var self = this;
        self.activeButton = buttonLabel;
        self.questionsContainer.innerHTML = '';
        self.questionsContainer.style.display = 'block';

        if (questions && questions.length > 0) {
            questions.forEach(function(question, index) {
                var questionElement = document.createElement('div');
                questionElement.innerText = question;
                questionElement.style.padding = '8px 0';
                questionElement.style.cursor = 'pointer';
                questionElement.style.fontSize = '1rem';
                questionElement.style.color = '#333';
                questionElement.style.transition = 'background-color 0.3s';
                questionElement.style.borderRadius = '4px';

                // Effets au survol des questions
                questionElement.addEventListener('mouseenter', function() {
                    questionElement.style.backgroundColor = '#F0F0F0';
                    self.inputField.value = question;
                });
                questionElement.addEventListener('mouseleave', function() {
                    questionElement.style.backgroundColor = 'transparent';
                    self.inputField.value = '';
                });

                // Action au clic sur une question
                questionElement.addEventListener('click', function() {
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

            // Gestion du survol du conteneur de questions
            self.questionsContainer.addEventListener('mouseenter', function() {
                self.isHoveringQuestions = true;
            });
            self.questionsContainer.addEventListener('mouseleave', function() {
                self.isHoveringQuestions = false;
            });
        }
    },

    handleSendQuestion: function(question) {
        // Traitement de l'envoi de la question
        console.log('Question sent:', question);
        this.inputField.value = '';
        this.activeButton = null;
        this.questionsContainer.style.display = 'none';
        this.inputField.placeholder = 'How can I help you today?';
    },
};

// Initialisation du widget au chargement de la page
window.addEventListener('DOMContentLoaded', function() {
    LucyWidget.init();
});
*/


/* PLACEHOLDER UNIQUE TRES BEAU LE MEILLEUR
var LucyWidget = {
    init: function () {
        // Création du conteneur principal
        var container = document.createElement('div');
        container.id = 'lucy-widget-container';

        // Style du conteneur principal
        container.style.position = 'fixed';
        container.style.bottom = '80px'; // Distance du bas de la page
        container.style.left = '50%';
        container.style.transform = 'translateX(-50%)';
        container.style.width = '90%'; // Largeur du conteneur
        container.style.maxWidth = '600px'; // Largeur maximale du conteneur
        container.style.zIndex = '1000';
        container.style.borderRadius = '25px';
        container.style.overflow = 'hidden';
        container.style.padding = '1px'; // Épaisseur du contour animé
        container.style.background = 'linear-gradient(45deg, #FF0000, #0000FF, #FF0000, #0000FF, #FF0000)'; // Dégradé rouge et bleu lumineux
        container.style.backgroundSize = '400% 400%';
        container.style.animation = 'gradientAnimation 10s ease infinite'; // Animation du dégradé
        container.style.transition = 'box-shadow 0.3s ease, animation-duration 0.3s ease';

        // Création du conteneur interne pour le contenu
        var innerContainer = document.createElement('div');
        innerContainer.style.position = 'relative';
        innerContainer.style.backgroundColor = 'transparent'; // Rendre transparent
        innerContainer.style.borderRadius = '10px'; // Léger arrondi pour correspondre au conteneur principal
        innerContainer.style.padding = '3px 3px';
        innerContainer.style.boxSizing = 'border-box';

        // Ajout du conteneur interne au conteneur principal
        container.appendChild(innerContainer);

        // Ajout du conteneur principal au corps du document
        document.body.appendChild(container);

        // Définition des keyframes pour l'animation du dégradé
        var style = document.createElement('style');
        style.innerHTML = `
            @keyframes gradientAnimation {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            /* Effet au survol *
            #lucy-widget-container:hover {
                animation-duration: 5s; /* Accélère l'animation *
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.7); /* Ombre portée renforcée *
            }
            /* Contour animé autour du champ de saisie *
            .input-wrapper {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                border-radius: 20px;
                padding: 2px; /* Épaisseur du contour *
                background: linear-gradient(45deg, #FF0000, #0000FF, #FF0000, #0000FF, #FF0000);
                background-size: 400% 400%;
                animation: gradientAnimation 10s ease infinite;
                pointer-events: none; /* Permet les clics à travers le wrapper *
            }
            /* Animation pour le contour autour du champ de saisie *
            .input-wrapper:hover {
                animation-duration: 5s; /* Accélère l'animation au survol *
            }
        `;
        document.head.appendChild(style);

        // Initialisation de l'interface utilisateur
        this.createInterface(innerContainer);
    },

    createInterface: function (container) {
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
        inputField.placeholder = 'What are you looking for?'; // Placeholder
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
        sendButton.style.background = 'none';
        sendButton.style.cursor = 'pointer';
        sendButton.style.zIndex = '2'; // Assure que le bouton est au-dessus du wrapper
        inputContainer.appendChild(sendButton);

        // Gestion du clic sur le bouton d'envoi
        sendButton.addEventListener('click', function() {
            self.handleSend(inputField);
        });

        // Gestion de la touche Entrée
        inputField.addEventListener('keypress', function(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                self.handleSend(inputField);
            }
        });

        // Gestion du clic en dehors du widget pour masquer les éléments interactifs si nécessaires
        document.addEventListener('mousedown', function(event) {
            var target = event.target;
            if (!container.contains(target)) {
                // Si d'autres éléments doivent être masqués, ajoutez-les ici
            }
        });
    },

    handleSend: function(inputField) {
        var message = inputField.value.trim();
        if (message === '') return;

        // Traitement de l'envoi du message
        console.log('Message sent:', message);
        inputField.value = '';
        inputField.placeholder = 'What are you looking for?';
    },
};

// Initialisation du widget au chargement de la page
window.addEventListener('DOMContentLoaded', function() {
    LucyWidget.init();
});
*/





var LucyWidget = {
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
        // Initial max-width and animation are set via CSS
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
        inputField.placeholder = 'What are you looking for?'; // Placeholder
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
                inputField.placeholder = 'What are you looking for?';
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
        this.inputField.placeholder = 'What are you looking for?';
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

    handleSendQuestion: function (question) {
        // Traitement de l'envoi de la question
        console.log('Question sent:', question);
        this.inputField.value = '';
        this.activeButton = null;
        this.questionsContainer.style.display = 'none';
        this.inputField.placeholder = 'What are you looking for?';
    },
};

// Initialisation du widget au chargement de la page
window.addEventListener('DOMContentLoaded', function () {
    LucyWidget.init();
});









// WIDGET AVEC CONTOUR DE COULEUR 
/*
var LucyWidget = {
    init: function () {
        // Création du conteneur principal
        var container = document.createElement('div');
        container.id = 'lucy-widget-container';

        // Style du conteneur principal
        container.style.position = 'fixed';
        container.style.bottom = '60px'; // Distance du bas de la page
        container.style.left = '50%';
        container.style.transform = 'translateX(-50%)';
        container.style.width = '90%'; // Largeur du conteneur
        container.style.maxWidth = '820px'; // Largeur maximale du conteneur
        container.style.zIndex = '1000';
        container.style.borderRadius = '12px';
        container.style.overflow = 'hidden';
        container.style.padding = '4px'; // Espace pour le contour animé
        container.style.background = 'linear-gradient(45deg, #FF7E5F, #6A11CB, #FF7E5F)'; // Dégradé orange et violet
        container.style.backgroundSize = '400% 400%';
        container.style.animation = 'gradientAnimation 5s ease infinite';
        container.style.transition = 'box-shadow 0.3s ease, animation-duration 0.3s ease';

        // Création du conteneur interne pour le contenu
        var innerContainer = document.createElement('div');
        innerContainer.style.position = 'relative';
        innerContainer.style.backgroundColor = '#FFFFFF';
        innerContainer.style.borderRadius = '10px'; // Léger arrondi pour correspondre au conteneur principal
        innerContainer.style.padding = '10px 10px';
        innerContainer.style.boxSizing = 'border-box';

        // Ajout du conteneur interne au conteneur principal
        container.appendChild(innerContainer);

        // Ajout du conteneur principal au corps du document
        document.body.appendChild(container);

        // Définition des keyframes pour l'animation du dégradé
        var style = document.createElement('style');
        style.innerHTML = `
            @keyframes gradientAnimation {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }
            /* Effet au survol *
            #lucy-widget-container:hover {
                animation-duration: 0.3s; /* Accélère l'animation *
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.7); /* Ombre portée renforcée *
            }
        `;
        document.head.appendChild(style);

        // Initialisation de l'interface utilisateur
        this.createInterface(innerContainer);
    },

    createInterface: function (container) {
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
        inputField.placeholder = 'How can I help you today?'; // Placeholder
        inputContainer.appendChild(inputField);

        // Création du bouton d'envoi à l'intérieur du champ de saisie
        var sendButton = document.createElement('button');
        sendButton.innerHTML = '<svg style="color: #011F5B; font-size: 1.2rem;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>';

        // Positionnement du bouton d'envoi
        sendButton.style.position = 'absolute';
        sendButton.style.right = '15px'; // Position par rapport au bord droit
        sendButton.style.top = '50%';
        sendButton.style.transform = 'translateY(-50%)';
        sendButton.style.border = 'none';
        sendButton.style.background = 'none';
        sendButton.style.cursor = 'pointer';
        inputContainer.appendChild(sendButton);

        // Gestion du clic sur le bouton d'envoi
        sendButton.addEventListener('click', function() {
            self.handleSend(inputField);
        });

        // Gestion de la touche Entrée
        inputField.addEventListener('keypress', function(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                self.handleSend(inputField);
            }
        });

        // Création des boutons d'options
        var buttonsContainer = document.createElement('div');
        buttonsContainer.style.width = '100%';
        buttonsContainer.style.marginTop = '10px'; // Marge supérieure des boutons
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.flexWrap = 'wrap';
        buttonsContainer.style.justifyContent = 'center';
        buttonsContainer.style.gap = '12px'; // Espace entre les boutons
        container.appendChild(buttonsContainer);

        // Définition des boutons disponibles
        var buttons = [
            {
                label: 'Academic Info',
                icon: '<svg style="color: #FF7E5F;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="20" height="20"><path fill="currentColor" d="M320 32L0 160l320 128 320-128L320 32zM64 192v128l256 128 256-128V192L320 320 64 192z"></path></svg>',
            },
            {
                label: 'Events & Tours',
                icon: '<svg style="color: #6A11CB;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="20" height="20"><path fill="currentColor" d="M152 64H296V24C296 10.7 306.7 0 320 0C333.3 0 344 10.7 344 24V64H400C426.5 64 448 85.5 448 112V464C448 490.5 426.5 512 400 512H48C21.5 512 0 490.5 0 464V112C0 85.5 21.5 64 48 64H104V24C104 10.7 114.7 0 128 0C141.3 0 152 10.7 152 24V64zM48 160V464H400V160H48z"></path></svg>',
            },
            {
                label: 'Admission',
                icon: '<svg style="color: #FF9D00;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="20" height="20"><path fill="currentColor" d="M96 96H544V320H96V96zM0 96C0 60.7 28.7 32 64 32H576C611.3 32 640 60.7 640 96V320C640 355.3 611.3 384 576 384H64C28.7 384 0 355.3 0 320V96zM48 352C21.5 352 0 373.5 0 400C0 426.5 21.5 448 48 448H592C618.5 448 640 426.5 640 400C640 373.5 618.5 352 592 352H48z"></path></svg>',
            },
            {
                label: 'Facilities',
                icon: '<svg style="color: #C471ED;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="20" height="20"><path fill="currentColor" d="M336 0H48C21.5 0 0 21.5 0 48V512H384V48C384 21.5 362.5 0 336 0zM320 480H64V64H320V480z"></path></svg>',
            },
            {
                label: 'Financial Aid',
                icon: '<svg style="color: #F64F59;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="20" height="20"><path fill="currentColor" d="M572.6 292.3L318.3 43.3C309.9 35.2 299.1 32 288 32s-21.9 3.2-30.3 11.3L3.4 292.3c-7.8 7.4-8.3 20-1 28.3s20 8.3 28.3 1l22.3-21.2V480c0 17.7 14.3 32 32 32H200c8.8 0 16-7.2 16-16V368c0-8.8 7.2-16 16-16H344c8.8 0 16 7.2 16 16V496c0 8.8 7.2 16 16 16H490c17.7 0 32-14.3 32-32V299.4l22.3 21.2c7.4 7.8 20 8.3 28.3 1s8.3-20 1-28.3z"></path></svg>',
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
        buttons.forEach(function(buttonData) {
            var button = document.createElement('button');
            button.innerHTML = buttonData.icon + ' ' + buttonData.label;
            button.style.border = '1px solid #011F5B';
            button.style.color = '#011F5B';
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

            // Effets au survol des boutons
            button.addEventListener('mouseenter', function() {
                self.handleButtonMouseEnter(buttonData.label, questionsMap[buttonData.label]);
                button.style.backgroundColor = '#011F5B';
                button.style.color = '#FFFFFF';
            });

            button.addEventListener('mouseleave', function() {
                button.style.backgroundColor = 'transparent';
                button.style.color = '#011F5B';
            });

            buttonsContainer.appendChild(button);
        });

        // Conteneur pour les suggestions de questions
        self.questionsContainer = document.createElement('div');
        self.questionsContainer.style.width = '100%';
        self.questionsContainer.style.maxWidth = '800px';
        self.questionsContainer.style.backgroundColor = '#FFFFFF';
        self.questionsContainer.style.border = '1px solid #BCBCBC';
        self.questionsContainer.style.borderRadius = '8px';
        self.questionsContainer.style.padding = '20px';
        self.questionsContainer.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        self.questionsContainer.style.marginTop = '10px';
        self.questionsContainer.style.display = 'none';
        container.appendChild(self.questionsContainer);

        self.activeButton = null;
        self.isHoveringQuestions = false;

        // Gestion du clic en dehors du widget
        document.addEventListener('mousedown', function(event) {
            var target = event.target;
            if (!container.contains(target) && !self.isHoveringQuestions) {
                self.activeButton = null;
                self.questionsContainer.style.display = 'none';
                inputField.value = '';
                inputField.placeholder = 'How can I help you today?';
            }
        });

        // Gestion des changements dans le champ de saisie
        self.inputField.addEventListener('input', function() {
            if (self.inputField.value.trim() === '') {
                self.activeButton = null;
                self.questionsContainer.style.display = 'none';
            }
        });
    },

    handleSend: function(inputField) {
        var message = inputField.value.trim();
        if (message === '') return;

        // Traitement de l'envoi du message
        console.log('Message sent:', message);
        inputField.value = '';
        this.activeButton = null;
        this.questionsContainer.style.display = 'none';
        inputField.placeholder = 'How can I help you today?';
    },

    handleButtonMouseEnter: function(buttonLabel, questions) {
        var self = this;
        self.activeButton = buttonLabel;
        self.questionsContainer.innerHTML = '';
        self.questionsContainer.style.display = 'block';

        if (questions && questions.length > 0) {
            questions.forEach(function(question, index) {
                var questionElement = document.createElement('div');
                questionElement.innerText = question;
                questionElement.style.padding = '8px 0';
                questionElement.style.cursor = 'pointer';
                questionElement.style.fontSize = '1rem';
                questionElement.style.color = '#333';
                questionElement.style.transition = 'background-color 0.3s';
                questionElement.style.borderRadius = '4px';

                // Effets au survol des questions
                questionElement.addEventListener('mouseenter', function() {
                    questionElement.style.backgroundColor = '#F0F0F0';
                    self.inputField.value = question;
                });
                questionElement.addEventListener('mouseleave', function() {
                    questionElement.style.backgroundColor = 'transparent';
                    self.inputField.value = '';
                });

                // Action au clic sur une question
                questionElement.addEventListener('click', function() {
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

            // Gestion du survol du conteneur de questions
            self.questionsContainer.addEventListener('mouseenter', function() {
                self.isHoveringQuestions = true;
            });
            self.questionsContainer.addEventListener('mouseleave', function() {
                self.isHoveringQuestions = false;
            });
        }
    },

    handleSendQuestion: function(question) {
        // Traitement de l'envoi de la question
        console.log('Question sent:', question);
        this.inputField.value = '';
        this.activeButton = null;
        this.questionsContainer.style.display = 'none';
        this.inputField.placeholder = 'How can I help you today?';
    },
};

// Initialisation du widget au chargement de la page
window.addEventListener('DOMContentLoaded', function() {
    LucyWidget.init();
});
*/



//WIDGET PARFAIT - QUI VA ETRE AMELIORER
/**
 * LucyWidget - JavaScript widget that replicates the design and functionality of the provided landing page code.
 */
/*
var LucyWidget = {
    init: function () {
        // Create the container
        var container = document.createElement('div');
        container.id = 'lucy-widget-container';
        container.style.position = 'fixed';
        container.style.bottom = '20px';
        container.style.left = '50%';
        container.style.transform = 'translateX(-50%)';
        container.style.width = '90%';
        container.style.maxWidth = '850px';
        container.style.backgroundColor = '#FFFFFF';
        container.style.zIndex = '1000';
        container.style.overflow = 'hidden';
        container.style.padding = '20px';
        container.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        container.style.borderRadius = '8px';
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.alignItems = 'center';

        document.body.appendChild(container);

        // Initialize the interface
        this.createInterface(container);
    },

    createInterface: function (container) {
        var self = this;

        // Create the heading
        var heading = document.createElement('h4');
        heading.innerText = 'How can I help you today?';
        heading.style.color = '#011F5B';
        heading.style.textAlign = 'center';
        heading.style.fontWeight = 'bold';
        heading.style.margin = '0';
        container.appendChild(heading);

        // Create the input area
        var inputContainer = document.createElement('div');
        inputContainer.style.width = '100%';
        inputContainer.style.marginTop = '20px';
        inputContainer.style.position = 'relative';
        container.appendChild(inputContainer);

        var inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.style.width = '100%';
        inputField.style.padding = '10px 20px';
        inputField.style.borderRadius = '35px';
        inputField.style.border = '1px solid #BCBCBC';
        inputField.style.fontSize = '1rem';
        inputField.style.backgroundColor = '#F4F4F4';
        inputField.style.color = '#A9A9A9';
        inputField.style.boxSizing = 'border-box';
        inputField.style.outline = 'none';

        inputContainer.appendChild(inputField);

        // Create the send button inside the input field
        var sendButton = document.createElement('button');
        sendButton.innerHTML = '<svg style="color: #011F5B; font-size: 1.5rem;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>';
        sendButton.style.position = 'absolute';
        sendButton.style.right = '20px';
        sendButton.style.top = '50%';
        sendButton.style.transform = 'translateY(-50%)';
        sendButton.style.border = 'none';
        sendButton.style.background = 'none';
        sendButton.style.cursor = 'pointer';
        inputContainer.appendChild(sendButton);

        // Handle send button click
        sendButton.addEventListener('click', function() {
            self.handleSend(inputField);
        });

        // Handle Enter key press
        inputField.addEventListener('keypress', function(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                self.handleSend(inputField);
            }
        });

        // Typing animation for initial text
        var initialText = 'Ask Lucy...';
        var index = 0;
        var isTyping = true;

        var typingInterval = setInterval(function() {
            if (index < initialText.length) {
                inputField.value += initialText.charAt(index);
                index++;
            } else {
                clearInterval(typingInterval);
                isTyping = false;
                inputField.value = ''; // Clear input after typing
                inputField.placeholder = 'Ask Lucy...'; // Set placeholder after typing
                inputField.style.color = '#000000';
            }
        }, 100);

        // Buttons
        var buttonsContainer = document.createElement('div');
        buttonsContainer.style.width = '100%';
        buttonsContainer.style.marginTop = '20px';
        buttonsContainer.style.display = 'flex';
        buttonsContainer.style.flexWrap = 'wrap';
        buttonsContainer.style.justifyContent = 'center';
        buttonsContainer.style.gap = '16px';
        container.appendChild(buttonsContainer);

        var buttons = [
            {
                label: 'Academic Info',
                icon: '<svg style="color: #3DD957;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="20" height="20"><path fill="currentColor" d="M320 32L0 160l320 128 320-128L320 32zM64 192v128l256 128 256-128V192L320 320 64 192z"></path></svg>',
            },
            {
                label: 'Events & Tours',
                icon: '<svg style="color: #F97315;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="20" height="20"><path fill="currentColor" d="M152 64H296V24C296 10.7 306.7 0 320 0C333.3 0 344 10.7 344 24V64H400C426.5 64 448 85.5 448 112V464C448 490.5 426.5 512 400 512H48C21.5 512 0 490.5 0 464V112C0 85.5 21.5 64 48 64H104V24C104 10.7 114.7 0 128 0C141.3 0 152 10.7 152 24V64zM48 160V464H400V160H48z"></path></svg>',
            },
            {
                label: 'Admission',
                icon: '<svg style="color: #1565D8;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="20" height="20"><path fill="currentColor" d="M96 96H544V320H96V96zM0 96C0 60.7 28.7 32 64 32H576C611.3 32 640 60.7 640 96V320C640 355.3 611.3 384 576 384H64C28.7 384 0 355.3 0 320V96zM48 352C21.5 352 0 373.5 0 400C0 426.5 21.5 448 48 448H592C618.5 448 640 426.5 640 400C640 373.5 618.5 352 592 352H48z"></path></svg>',
            },
            {
                label: 'Facilities',
                icon: '<svg style="color: #7C3BEC;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" width="20" height="20"><path fill="currentColor" d="M336 0H48C21.5 0 0 21.5 0 48V512H384V48C384 21.5 362.5 0 336 0zM320 480H64V64H320V480z"></path></svg>',
            },
            {
                label: 'Financial Aid',
                icon: '<svg style="color: #EF4361;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="20" height="20"><path fill="currentColor" d="M572.6 292.3L318.3 43.3C309.9 35.2 299.1 32 288 32s-21.9 3.2-30.3 11.3L3.4 292.3c-7.8 7.4-8.3 20-1 28.3s20 8.3 28.3 1l22.3-21.2V480c0 17.7 14.3 32 32 32H200c8.8 0 16-7.2 16-16V368c0-8.8 7.2-16 16-16H344c8.8 0 16 7.2 16 16V496c0 8.8 7.2 16 16 16H490c17.7 0 32-14.3 32-32V299.4l22.3 21.2c7.4 7.8 20 8.3 28.3 1s8.3-20 1-28.3z"></path></svg>',
            },
        ];

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

        buttons.forEach(function(buttonData) {
            var button = document.createElement('button');
            button.innerHTML = buttonData.icon + ' ' + buttonData.label;
            button.style.border = '1px solid #011F5B';
            button.style.color = '#011F5B';
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

            button.addEventListener('mouseenter', function() {
                self.handleButtonMouseEnter(buttonData.label, questionsMap[buttonData.label]);
                button.style.backgroundColor = '#011F5B';
                button.style.color = '#FFFFFF';
            });

            button.addEventListener('mouseleave', function() {
                button.style.backgroundColor = 'transparent';
                button.style.color = '#011F5B';
            });

            buttonsContainer.appendChild(button);
        });

        // Questions suggestions container
        self.questionsContainer = document.createElement('div');
        self.questionsContainer.style.width = '100%';
        self.questionsContainer.style.maxWidth = '800px';
        self.questionsContainer.style.backgroundColor = '#FFFFFF';
        self.questionsContainer.style.border = '1px solid #BCBCBC';
        self.questionsContainer.style.borderRadius = '8px';
        self.questionsContainer.style.padding = '20px';
        self.questionsContainer.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
        self.questionsContainer.style.marginTop = '20px';
        self.questionsContainer.style.display = 'none'; // Initially hidden
        container.appendChild(self.questionsContainer);

        self.activeButton = null;
        self.isHoveringQuestions = false;

        // Add event listener to detect clicks outside
        document.addEventListener('mousedown', function(event) {
            var target = event.target;
            if (!container.contains(target) && !self.isHoveringQuestions) {
                self.activeButton = null;
                self.questionsContainer.style.display = 'none';
                inputField.value = '';
                inputField.placeholder = 'Ask Lucy...';
            }
        });

        self.inputField.addEventListener('input', function() {
            if (!isTyping && self.inputField.value.trim() === '') {
                self.activeButton = null;
                self.questionsContainer.style.display = 'none';
            }
        });
    },

    handleSend: function(inputField) {
        var message = inputField.value.trim();
        if (message === '') return;

        // Handle sending the message
        console.log('Message sent:', message);
        inputField.value = '';
        this.activeButton = null;
        this.questionsContainer.style.display = 'none';
        inputField.placeholder = 'Ask Lucy...';
    },

    handleButtonMouseEnter: function(buttonLabel, questions) {
        var self = this;
        self.activeButton = buttonLabel;
        self.questionsContainer.innerHTML = '';
        self.questionsContainer.style.display = 'block';

        if (questions && questions.length > 0) {
            questions.forEach(function(question, index) {
                var questionElement = document.createElement('div');
                questionElement.innerText = question;
                questionElement.style.padding = '8px 0';
                questionElement.style.cursor = 'pointer';
                questionElement.style.fontSize = '1rem';
                questionElement.style.color = '#333';
                questionElement.style.transition = 'background-color 0.3s';
                questionElement.style.borderRadius = '4px';
                questionElement.addEventListener('mouseenter', function() {
                    questionElement.style.backgroundColor = '#F0F0F0';
                    self.inputField.value = question;
                });
                questionElement.addEventListener('mouseleave', function() {
                    questionElement.style.backgroundColor = 'transparent';
                    self.inputField.value = '';
                });
                questionElement.addEventListener('click', function() {
                    self.handleSendQuestion(question);
                });
                self.questionsContainer.appendChild(questionElement);

                if (index < questions.length - 1) {
                    var divider = document.createElement('hr');
                    divider.style.width = '100%';
                    divider.style.border = 'none';
                    divider.style.borderTop = '1px solid #BCBCBC';
                    self.questionsContainer.appendChild(divider);
                }
            });

            // Handle hovering over questions container
            self.questionsContainer.addEventListener('mouseenter', function() {
                self.isHoveringQuestions = true;
            });
            self.questionsContainer.addEventListener('mouseleave', function() {
                self.isHoveringQuestions = false;
            });
        }
    },

    handleSendQuestion: function(question) {
        // Handle sending the question
        console.log('Question sent:', question);
        this.inputField.value = '';
        this.activeButton = null;
        this.questionsContainer.style.display = 'none';
    },
};

// Initialize the widget when the page loads
window.addEventListener('DOMContentLoaded', function() {
    LucyWidget.init();
});
*/










       


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