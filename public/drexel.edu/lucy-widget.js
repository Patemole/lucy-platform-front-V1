// lucy-widget.js

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