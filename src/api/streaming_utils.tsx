
type StreamOutput<T> = T | string;

type NonEmptyObject = { [k: string]: any };

// Fonction qui traite chaque fragment de chunk reçu
const processSingleChunk = <T extends NonEmptyObject>(
    chunk: string, // Chunk qui vient d'être récupéré
    currPartialChunk: string | null // Sérialisation des chunks précédents
): [T | null, string | null] => {
    // On concatène les morceaux précédents et le morceau actuel
    const completeChunk = (currPartialChunk || "") + chunk;

    console.log("Traitement du chunk:", completeChunk);

    // On essaye de convertir le morceau complet en JSON
    try {
        const chunkJson = JSON.parse(completeChunk) as T;

        // Si on a réussi à convertir en JSON, on retourne le morceau complet et null pour le morceau précédent
        console.log("Le chunk a été converti en JSON avec succès:", chunkJson);
        return [chunkJson, null];
    } catch (err) {
        // Si la conversion échoue, on retourne null pour le JSON complet et conserve le morceau actuel en tant que partiel
        console.log("Échec de la conversion du chunk en JSON, morceau partiel conservé:", completeChunk);
        return [null, completeChunk];
    }
};




//NOUVELLE FONCTION POUR PRENDRE EN COMPTE LE ANSWER WAITING 
export async function* handleStream<T extends NonEmptyObject>(
    streamingResponse: Response
): AsyncGenerator<StreamOutput<T>[], void, unknown> {
    const reader = streamingResponse.body?.getReader();
    const decoder = new TextDecoder("utf-8");

    let isInDocument = false;
    let documentBuffer = "";

    let isInImage = false;
    let imageBuffer = "";

    let isInTak = false;
    let takBuffer = "";

    let isInChart = false;
    let chartBuffer = "";

    let isInCourse = false;
    let courseBuffer = "";

    let isInRelatedQuestions = false;
    let relatedQuestionsBuffer = "";

    let isInWaiting = false;
    let waitingBuffer = "";

    let previousPartialChunk: string | null = null;

    console.log("Début du traitement du flux");

    while (true) {
        const { done, value } = await reader?.read() || {};

        // Ajout du log pour voir les valeurs de done et value
        console.log("Valeur de done:", done);
        console.log("Valeur de value (chunk brut):", value ? new TextDecoder("utf-8").decode(value) : value);


        if (done) {
            console.log("Lecture du flux terminée");

            // Handle any remaining buffered content for documents, images, related questions, tak, or answer_waiting
            if (isInDocument && documentBuffer) {
                try {
                    console.log("Tentative de parsing du document JSON final:", documentBuffer);
                    const documentJson = JSON.parse(documentBuffer); // Convertir le document final en JSON
                    console.log("Document JSON émis à la fin du flux:", documentJson);
                    yield documentJson;
                } catch (err) {
                    console.error("Erreur lors du parsing du document JSON à la fin du flux:", err);
                }
                documentBuffer = "";
                isInDocument = false;
            }

            if (isInImage && imageBuffer) {
                try {
                    console.log("Tentative de parsing de l'image JSON finale:", imageBuffer);
                    const imageJson = JSON.parse(imageBuffer); // Convertir l'image finale en JSON
                    console.log("Image JSON émise à la fin du flux:", imageJson);
                    yield imageJson;
                } catch (err) {
                    console.error("Erreur lors du parsing de l'image JSON à la fin du flux:", err);
                }
                imageBuffer = "";
                isInImage = false;
            }

            if (isInTak && takBuffer) {
                try {
                    console.log("Tentative de parsing du tak JSON final:", takBuffer);
                    const takJson = JSON.parse(takBuffer); // Convertir le tak final en JSON
                    console.log("tak JSON émise à la fin du flux:", takJson);
                    yield takJson;
                } catch (err) {
                    console.error("Erreur lors du parsing du tak JSON à la fin du flux:", err);
                }
                takBuffer = "";
                isInTak = false;
            }

            if (isInChart && chartBuffer) {
                try {
                    console.log("Tentative de parsing du chart JSON final:", chartBuffer);
                    const chartJson = JSON.parse(chartBuffer); // Convertir le tak final en JSON
                    console.log("chart JSON émise à la fin du flux:", chartJson);
                    yield chartJson;
                } catch (err) {
                    console.error("Erreur lors du parsing du tak JSON à la fin du flux:", err);
                }
                chartBuffer = "";
                isInChart = false;
            }


            if (isInCourse && courseBuffer) {
                try {
                    console.log("Tentative de parsing du course JSON final:", courseBuffer);
                    const courseJson = JSON.parse(courseBuffer); // Convertir le tak final en JSON
                    console.log("course JSON émise à la fin du flux:", courseJson);
                    yield courseJson;
                } catch (err) {
                    console.error("Erreur lors du parsing du course JSON à la fin du flux:", err);
                }
                courseBuffer = "";
                isInCourse = false;
            }


            if (isInRelatedQuestions && relatedQuestionsBuffer) {
                try {
                    console.log("Tentative de parsing des related questions JSON finales:", relatedQuestionsBuffer);
                    const relatedQuestionsJson = JSON.parse(relatedQuestionsBuffer); // Convertir les related questions finales en JSON
                    console.log("Related Questions JSON émises à la fin du flux:", relatedQuestionsJson);
                    yield relatedQuestionsJson;
                } catch (err) {
                    console.error("Erreur lors du parsing des related questions JSON à la fin du flux:", err);
                }
                relatedQuestionsBuffer = "";
                isInRelatedQuestions = false;
            }

            if (isInWaiting && waitingBuffer) {
                try {
                    console.log("Tentative de parsing du waiting JSON final:", waitingBuffer);
                    const waitingJson = JSON.parse(waitingBuffer); // Convertir le waiting final en JSON
                    console.log("Waiting JSON émis à la fin du flux:", waitingJson);
                    yield waitingJson;
                } catch (err) {
                    console.error("Erreur lors du parsing du waiting JSON à la fin du flux:", err);
                }
                waitingBuffer = "";
                isInWaiting = false;
            }

            break;
        }

        const decodedValue = decoder.decode(value, { stream: true });
        console.log("Chunk brut reçu:", decodedValue);

        // Detection and processing of <JSON_DOCUMENT_START> and <JSON_DOCUMENT_END>
        if (decodedValue.includes("<JSON_DOCUMENT_START>")) {
            console.log("Détection de <JSON_DOCUMENT_START> dans le chunk:", decodedValue);
            isInDocument = true;
            documentBuffer = decodedValue.split("<JSON_DOCUMENT_START>")[1].split("<JSON_DOCUMENT_END>")[0]; // Extract content between tags
            console.log("Début d'accumulation du document JSON, buffer actuel:", documentBuffer);

            if (decodedValue.includes("<JSON_DOCUMENT_END>")) {
                try {
                    console.log("Détection de <JSON_DOCUMENT_END> dans le même chunk.");
                    const documentJson = JSON.parse(documentBuffer);
                    console.log("Document JSON reçu et converti:", documentJson);
                    yield documentJson;
                    isInDocument = false;
                    documentBuffer = "";
                } catch (err) {
                    console.error("Erreur lors du parsing du document JSON:", err);
                }
            }
            continue;
        }

        // Detection and processing of <ANSWER_TAK> and <ANSWER_TAK_END>
        if (decodedValue.includes("<ANSWER_TAK>")) {
            console.log("Détection de <ANSWER_TAK> dans le chunk:", decodedValue);
            isInTak = true;
            takBuffer = decodedValue.split("<ANSWER_TAK>")[1].split("<ANSWER_TAK_END>")[0]; // Extract content between tags
            console.log("Début d'accumulation de tak JSON, buffer actuel:", takBuffer);

            if (decodedValue.includes("<ANSWER_TAK_END>")) {
                try {
                    console.log("Détection de <ANSWER_TAK_END> dans le même chunk.");
                    const takJson = JSON.parse(takBuffer);
                    console.log("tak JSON reçue et convertie:", takJson);
                    yield takJson;
                    isInTak = false;
                    takBuffer = "";
                } catch (err) {
                    console.error("Erreur lors du parsing de tak JSON:", err);
                }
            }
            continue;
        }


        // Detection and processing of <ANSWER_CHART> and <ANSWER_CHART_END>
        if (decodedValue.includes("<ANSWER_CHART>")) {
            console.log("Détection de <ANSWER_CHART> dans le chunk:", decodedValue);
            isInChart = true;
            chartBuffer = decodedValue.split("<ANSWER_CHART>")[1].split("<ANSWER_CHART_END>")[0]; // Extract content between tags
            console.log("Début d'accumulation de chart JSON, buffer actuel:", chartBuffer);

            if (decodedValue.includes("<ANSWER_CHART_END>")) {
                try {
                    console.log("Détection de <ANSWER_CHART_END> dans le même chunk.");
                    const chartJson = JSON.parse(chartBuffer);
                    console.log("tak JSON reçue et convertie:", chartJson);
                    yield chartJson;
                    isInChart = false;
                    chartBuffer = "";
                } catch (err) {
                    console.error("Erreur lors du parsing de chart JSON:", err);
                }
            }
            continue;
        }


        // Detection and processing of <ANSWER_COURSE> and <ANSWER_COURSE_END>
        if (decodedValue.includes("<ANSWER_COURSE>")) {
            console.log("Détection de <ANSWER_COURSE> dans le chunk:", decodedValue);
            isInCourse = true;
            courseBuffer = decodedValue.split("<ANSWER_COURSE>")[1].split("<ANSWER_COURSE_END>")[0]; // Extract content between tags
            console.log("Début d'accumulation de course JSON, buffer actuel:", courseBuffer);

            if (decodedValue.includes("<ANSWER_COURSE_END>")) {
                try {
                    console.log("Détection de <ANSWER_COURSE_END> dans le même chunk.");
                    const courseJson = JSON.parse(courseBuffer);
                    console.log("course JSON reçue et convertie:", courseJson);
                    yield courseJson;
                    isInCourse = false;
                    courseBuffer = "";
                } catch (err) {
                    console.error("Erreur lors du parsing de course JSON:", err);
                }
            }
            continue;
        }

        // Detection and processing of <IMAGE_DATA> and <IMAGE_DATA_END>
        if (decodedValue.includes("<IMAGE_DATA>")) {
            console.log("Détection de <IMAGE_DATA> dans le chunk:", decodedValue);
            isInImage = true;
            imageBuffer = decodedValue.split("<IMAGE_DATA>")[1].split("<IMAGE_DATA_END>")[0]; // Extract content between tags
            console.log("Début d'accumulation de l'image JSON, buffer actuel:", imageBuffer);

            if (decodedValue.includes("<IMAGE_DATA_END>")) {
                try {
                    console.log("Détection de <IMAGE_DATA_END> dans le même chunk.");
                    const imageJson = JSON.parse(imageBuffer);
                    console.log("Image JSON reçue et convertie:", imageJson);
                    yield imageJson;
                    isInImage = false;
                    imageBuffer = "";
                } catch (err) {
                    console.error("Erreur lors du parsing de l'image JSON:", err);
                }
            }
            continue;
        }

        // Detection and processing of <RELATED_QUESTIONS> and <RELATED_QUESTIONS_END>
        if (decodedValue.includes("<RELATED_QUESTIONS>")) {
            console.log("Détection de <RELATED_QUESTIONS> dans le chunk:", decodedValue);
            isInRelatedQuestions = true;
            relatedQuestionsBuffer = decodedValue.split("<RELATED_QUESTIONS>")[1].split("<RELATED_QUESTIONS_END>")[0]; // Extract content between tags
            console.log("Début d'accumulation des related questions JSON, buffer actuel:", relatedQuestionsBuffer);

            if (decodedValue.includes("<RELATED_QUESTIONS_END>")) {
                try {
                    console.log("Détection de <RELATED_QUESTIONS_END> dans le même chunk.");
                    const relatedQuestionsJson = JSON.parse(relatedQuestionsBuffer);
                    console.log("Related Questions JSON reçues et converties:", relatedQuestionsJson);
                    yield relatedQuestionsJson;
                    isInRelatedQuestions = false;
                    relatedQuestionsBuffer = "";
                } catch (err) {
                    console.error("Erreur lors du parsing des related questions JSON:", err);
                }
            }
            continue;
        }

        // Detection and processing of <ANSWER_WAITING> and <ANSWER_WAITING_END>
        if (decodedValue.includes("<ANSWER_WAITING>")) {
            console.log("Détection de <ANSWER_WAITING> dans le chunk:", decodedValue);
            isInWaiting = true;
            waitingBuffer = decodedValue.split("<ANSWER_WAITING>")[1].split("<ANSWER_WAITING_END>")[0]; // Extract content between tags
            console.log("Début d'accumulation de waiting JSON, buffer actuel:", waitingBuffer);

            if (decodedValue.includes("<ANSWER_WAITING_END>")) {
                try {
                    console.log("Détection de <ANSWER_WAITING_END> dans le même chunk.");
                    const waitingJson = JSON.parse(waitingBuffer);
                    console.log("Waiting JSON reçue et convertie:", waitingJson);
                    yield waitingJson;
                    isInWaiting = false;
                    waitingBuffer = "";
                } catch (err) {
                    console.error("Erreur lors du parsing du waiting JSON:", err);
                }
            }
            continue;
        }

        // Handling document buffering until <JSON_DOCUMENT_END> is detected
        if (isInDocument) {
            console.log("Accumulation du document JSON en cours...");
            if (decodedValue.includes("<JSON_DOCUMENT_END>")) {
                documentBuffer += decodedValue.split("<JSON_DOCUMENT_END>")[0];
                try {
                    const documentJson = JSON.parse(documentBuffer.trim());
                    console.log("Document JSON reçu et converti:", documentJson);
                    yield documentJson;
                } catch (err) {
                    console.error("Erreur lors du parsing du document JSON:", err);
                }
                isInDocument = false;
                documentBuffer = "";
            } else {
                documentBuffer += decodedValue;
            }
            continue;
        }

        // Handling image buffering until <IMAGE_DATA_END> is detected
        if (isInImage) {
            console.log("Accumulation de l'image JSON en cours...");
            if (decodedValue.includes("<IMAGE_DATA_END>")) {
                imageBuffer += decodedValue.split("<IMAGE_DATA_END>")[0];
                try {
                    const imageJson = JSON.parse(imageBuffer.trim());
                    console.log("Image JSON reçue et convertie:", imageJson);
                    yield imageJson;
                } catch (err) {
                    console.error("Erreur lors du parsing de l'image JSON:", err);
                }
                isInImage = false;
                imageBuffer = "";
            } else {
                imageBuffer += decodedValue;
            }
            continue;
        }

        // Handling related questions buffering until <RELATED_QUESTIONS_END> is detected
        if (isInRelatedQuestions) {
            console.log("Accumulation des related questions JSON en cours...");
            if (decodedValue.includes("<RELATED_QUESTIONS_END>")) {
                relatedQuestionsBuffer += decodedValue.split("<RELATED_QUESTIONS_END>")[0];
                try {
                    const relatedQuestionsJson = JSON.parse(relatedQuestionsBuffer.trim());
                    console.log("Related Questions JSON reçues et converties:", relatedQuestionsJson);
                    yield relatedQuestionsJson;
                } catch (err) {
                    console.error("Erreur lors du parsing des related questions JSON:", err);
                }
                isInRelatedQuestions = false;
                relatedQuestionsBuffer = "";
            } else {
                relatedQuestionsBuffer += decodedValue;
            }
            continue;
        }

        // Handling waiting buffering until <ANSWER_WAITING_END> is detected
        if (isInWaiting) {
            console.log("Accumulation du waiting JSON en cours...");
            if (decodedValue.includes("<ANSWER_WAITING_END>")) {
                waitingBuffer += decodedValue.split("<ANSWER_WAITING_END>")[0];
                try {
                    const waitingJson = JSON.parse(waitingBuffer.trim());
                    console.log("Waiting JSON reçu et converti:", waitingJson);
                    yield waitingJson;
                } catch (err) {
                    console.error("Erreur lors du parsing du waiting JSON:", err);
                }
                isInWaiting = false;
                waitingBuffer = "";
            } else {
                waitingBuffer += decodedValue;
            }
            continue;
        }

        // If not processing documents, images, waiting, or related questions, process regular text chunks
        const [completedChunk, newPartialChunk]: [T | null, string | null] = processSingleChunk<T>(
            decodedValue,
            previousPartialChunk
        );

        if (newPartialChunk) {
            console.log("Nouveau fragment partiel de texte:", newPartialChunk);
            yield [newPartialChunk as StreamOutput<T>];
        }

        if (completedChunk) {
            console.log("Chunk JSON complet reçu:", completedChunk);
            yield [completedChunk];
        }

        previousPartialChunk = newPartialChunk;
    }

    console.log("Fin du traitement du flux");
}

