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

        // Create a button for opening/closing the widget
        var button = document.createElement('button');
        button.innerHTML = 'Ask Lucy to find information';
        button.style.position = 'fixed';
        button.style.bottom = '60px';
        button.style.right = '20px';
        button.style.padding = '10px 20px';
        button.style.backgroundColor = '#FDBB30'; // Drexel gold
        button.style.color = '#002663';
        button.style.border = 'none';
        button.style.borderRadius = '5px';
        button.style.cursor = 'pointer';
        button.style.zIndex = '1000';

        document.body.appendChild(button);
        console.log("'Chat avec Lucy' button added to the DOM.");

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
        container.style.width = '300px';
        container.style.height = '410px';
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
        header.style.backgroundColor = '#002663'; // Drexel blue
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
        chatArea.style.height = '300px';
        chatArea.id = 'chat-area';

        // Display initial prompt if no messages
        var initialMessage = document.createElement('div');
        initialMessage.style.textAlign = 'center';
        initialMessage.style.color = '#002663';
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
        inputField.style.fontSize = '0.9rem'; // Adjusted placeholder size

        var sendButton = document.createElement('button');
        sendButton.innerHTML = 'Send'; // "Send" button instead of emoji
        sendButton.style.backgroundColor = '#FDBB30'; // Drexel gold
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

        // Display the user's message (on the right)
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

        // User's avatar (to be imported)
        var userAvatar = document.createElement('img');
        userAvatar.src = '/drexel.edu/student_face.png'; // Update with actual path
        userAvatar.alt = 'Student Avatar';
        userAvatar.style.width = '30px';
        userAvatar.style.height = '30px';
        userAvatar.style.borderRadius = '50%';
        userAvatar.style.marginLeft = '10px'; // Move it closer to the text

        // User's name ("You")
        var userName = document.createElement('span');
        userName.innerHTML = '<strong>You</strong>';
        userName.style.color = '#002663'; // Drexel blue
        userName.style.fontSize = '1rem';

        // Message bubble
        var userMessageBubble = document.createElement('div');
        userMessageBubble.style.backgroundColor = '#e6f0ff'; // Drexel blue background (lighter shade)
        userMessageBubble.style.color = '#000'; // Text color
        userMessageBubble.style.padding = '10px';
        userMessageBubble.style.borderRadius = '10px';
        userMessageBubble.style.display = 'inline-block'; // So it fits better next to the avatar
        userMessageBubble.style.maxWidth = '60%'; // Ensure it doesn't take up too much space
        userMessageBubble.innerHTML = message;

        // Create a row for name and avatar
        var userHeader = document.createElement('div');
        userHeader.style.display = 'flex';
        userHeader.style.justifyContent = 'flex-end'; // Align to the right
        userHeader.appendChild(userName);
        userHeader.appendChild(userAvatar);

        // Append header and message bubble to the message container
        userMessageContainer.appendChild(userHeader);
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

        // Create the row containing Lucy's image, name, and verification icon
        var lucyHeader = document.createElement('div');
        lucyHeader.style.display = 'flex';
        lucyHeader.style.alignItems = 'center';

        // Lucy's avatar (to be imported)
        var avatar = document.createElement('img');
        avatar.src = '/drexel.edu/lucy_avatar.png'; // Update with actual image path
        avatar.alt = 'Lucy Avatar';
        avatar.style.width = '30px'; // Reduced size
        avatar.style.height = '30px';
        avatar.style.borderRadius = '50%';
        avatar.style.marginRight = '10px';

        // Lucy's name
        var name = document.createElement('span');
        name.innerHTML = '<strong>Lucy</strong>';
        name.style.color = '#002663'; // Drexel blue
        name.style.fontSize = '0.9rem'; // Reduced text size

        // Verification icon (to be imported)
        var verificationIcon = document.createElement('img');
        verificationIcon.src = '/drexel.edu/certifiate.png'; // Update with actual image path
        verificationIcon.alt = 'Verified';
        verificationIcon.style.width = '18px'; // Adjusted size
        verificationIcon.style.height = '18px';
        verificationIcon.style.marginLeft = '5px';

        // Append avatar, name, and verification icon to the header
        lucyHeader.appendChild(avatar);
        lucyHeader.appendChild(name);
        lucyHeader.appendChild(verificationIcon);

        // Lucy's response message
        var lucyResponse = document.createElement('div');
        lucyResponse.style.marginTop = '5px';
        lucyResponse.innerHTML = message;

        // Append the header and response message to the message container
        lucyMessageContainer.appendChild(lucyHeader);
        lucyMessageContainer.appendChild(lucyResponse);

        // Append the entire message container to the chat area
        chatArea.appendChild(lucyMessageContainer);

        // Scroll to the bottom
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