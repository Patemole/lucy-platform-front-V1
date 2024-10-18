// Code du widget Lucy

(function() {
    // Crée un conteneur pour le widget
    var container = document.createElement('div');
    container.id = 'lucy-chat-widget';
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.width = '300px';
    container.style.height = '400px';
    container.style.backgroundColor = '#f5f5f5';
    container.style.border = '2px solid #000';
    container.style.borderRadius = '10px';
    container.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.2)';
    container.style.display = 'none'; // Le widget sera caché au départ
    
    document.body.appendChild(container);
  
    // Crée un bouton pour ouvrir/fermer le widget
    var button = document.createElement('button');
    button.innerHTML = 'Chat with Lucy';
    button.style.position = 'fixed';
    button.style.bottom = '20px';
    button.style.right = '20px';
    button.style.padding = '10px 20px';
    button.style.backgroundColor = '#007BFF';
    button.style.color = '#fff';
    button.style.border = 'none';
    button.style.borderRadius = '5px';
    button.style.cursor = 'pointer';
  
    document.body.appendChild(button);
  
    // Fonction pour afficher/masquer le widget
    button.addEventListener('click', function() {
      if (container.style.display === 'none') {
        container.style.display = 'block';
      } else {
        container.style.display = 'none';
      }
    });
  
    // Initialisation du contenu du widget (ici tu peux ajouter ta logique de chatbot)
    var message = document.createElement('div');
    message.innerHTML = '<p>Welcome on Lucy ! How can I help you today?</p>';
    message.style.padding = '20px';
    message.style.fontSize = '16px';
  
    container.appendChild(message);
  })();