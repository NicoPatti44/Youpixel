document.addEventListener('DOMContentLoaded', function() {
    const numTotalImages = 105; // Nombre total d'images que vous avez
    const numImagesToSelect = 10; // Nombre d'images à sélectionner pour le jeu

    const menuContainer = document.getElementById('menu-container');
    const gameContainer = document.getElementById('game-container');
    const playButton = document.getElementById('play-button');
    const imageElement = document.getElementById('image-to-guess');
    const guessInput = document.getElementById('guess-input');
    const submitButton = document.getElementById('submit-button');
    const resultMessage = document.getElementById('result-message');
    const scoreDisplay = document.getElementById('score');
    const qualityButtons = document.querySelectorAll('.quality-button');

    // Chemins des dossiers de qualité d'image
    const imageFolders = {
        0: 'images5',
        1: 'images10',
        2: 'images20',
        3: 'images50',
        4: 'images'
    };

    let selectedImageIndices = [];
    let currentImageIndex = 0;
    let currentQualityLevel = 0; // Niveau de qualité actuel (0 pour 5%, 1 pour 10%, ..., 4 pour Normal)
    let score = 0;

    playButton.addEventListener('click', function() {
        // Masquer le menu et afficher le jeu
        menuContainer.style.display = 'none';
        gameContainer.style.display = 'block';

        // Réinitialiser le score et le scoreDisplay
        score = 0;
        scoreDisplay.textContent = '';

        // Sélectionner 10 images aléatoires sans répétition
        selectedImageIndices = selectRandomImages(numTotalImages, numImagesToSelect);

        // Démarrer le jeu avec la première image
        startNextRound();
    });

    submitButton.addEventListener('click', function() {
        submitGuess();
    });

    guessInput.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            submitGuess();
        }
    });

    // Ajouter un événement pour chaque bouton de qualité
    qualityButtons.forEach(button => {
        button.addEventListener('click', function() {
            const quality = parseInt(button.dataset.quality);
            changeImageQuality(quality);
        });
    });

    function submitGuess() {
        const userGuess = guessInput.value.trim().toLowerCase();

        // Récupérer l'index correct pour le fichier texte en fonction de currentImageIndex
        const correctIndex = selectedImageIndices[currentImageIndex - 1];
        const correctFileName = `nom${correctIndex}.txt`;

        fetch(`noms/${correctFileName}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Fichier non trouvé: ${correctFileName}`);
                }
                return response.text();
            })
            .then(data => {
                const correctName = data.trim().toLowerCase();

                if (userGuess === correctName) {
                    showResultMessage("Bonne réponse!", true);
                    score++; // Augmenter le score pour chaque bonne réponse
                } else {
                    showResultMessage(`Mauvaise réponse. La réponse correcte était "${correctName}".`, false);
                }

                setTimeout(function() {
                    resultMessage.textContent = "";
                    startNextRound();
                }, 2000); // 2 secondes avant de passer à la prochaine image
            })
            .catch(error => {
                console.error('Erreur de chargement du fichier:', error);
                showResultMessage('Erreur de chargement. Veuillez réessayer.', false);
            });

        guessInput.value = ""; // Réinitialiser le champ de saisie après chaque réponse
    }

    function startNextRound() {
        if (currentImageIndex < numImagesToSelect) {
            currentImageIndex++;
            currentQualityLevel = 0; // Réinitialiser à 5% de qualité pour chaque nouvelle image
            updateImage(selectedImageIndices[currentImageIndex - 1], currentQualityLevel);
        } else {
            endGame(); // Appeler endGame() lorsque toutes les images ont été devinées
        }
    }

    function updateImage(index, qualityLevel) {
        const folder = imageFolders[qualityLevel];
        const imageUrl = `${folder}/image${index}.jpg`;

        imageElement.src = imageUrl;
        imageElement.style.imageRendering = 'pixelated'; // Toujours afficher les pixels
    }

    function changeImageQuality(quality) {
        currentQualityLevel = quality;
        updateImage(selectedImageIndices[currentImageIndex - 1], currentQualityLevel);
    }

    function showResultMessage(message, isCorrect) {
        resultMessage.textContent = message;
        resultMessage.style.color = isCorrect ? "green" : "red";
    }

    function endGame() {
        // Calculer le score final sur 10
        const scoreOutOf10 = (score / numImagesToSelect) * 10;

        // Réinitialiser les variables pour une nouvelle partie si nécessaire
        currentImageIndex = 0;
        currentQualityLevel = 0;

        // Masquer le jeu et afficher le menu à nouveau après un délai
        setTimeout(function() {
            gameContainer.style.display = 'none';
            menuContainer.style.display = 'block';
        }, 3000); // Attendre 3 secondes avant de revenir au menu

        // Afficher le score final
        scoreDisplay.textContent = `Votre score : ${score} / ${numImagesToSelect} (${scoreOutOf10.toFixed(1)} / 10)`;
    }

    function selectRandomImages(totalImages, numImages) {
        const indices = [];
        while (indices.length < numImages) {
            const randomIndex = Math.floor(Math.random() * totalImages) + 1;
            if (!indices.includes(randomIndex)) {
                indices.push(randomIndex);
            }
        }
        return indices;
    }
});
