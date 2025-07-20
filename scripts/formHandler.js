document.getElementById('characterForm').addEventListener('submit', async function (e) {
    e.preventDefault();
    const currentSeason = 5; // Sets the current season to 5, adjust as season changes
    const form = e.target; // Get reference to the form

    // Get submit button and save original text at the start
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;

    try {
        // Show loading state
        submitButton.textContent = 'Generating...';
        submitButton.disabled = true;

        // Get form values
        const timelineDepth = parseInt(document.getElementById('timelineDepth').value);
        const characterName = document.getElementById('characterName').value.trim();
        const characterClass = parseInt(document.getElementById('characterClass').value);
        const hardcore = document.querySelector('input[name="hardcore"]').checked;
        const selfFound = document.querySelector('input[name="selfFound"]').checked;
        const characterType = document.querySelector('input[name="characterType"]').checked;

        // Validate inputs
        if (!characterName) {
            alert('Please enter a character name');
            return;
        }

        // Determine template file
        let templateFile;
        switch (timelineDepth) {
            case 0:
                templateFile = "BASE_0.json";
                break;
            case 1:
                templateFile = "BASE_100_PreMonolith.json";
                break;
            case 2:
                templateFile = "BASE_100_Aberroth.json";
                break;
            default:
                templateFile = "BASE_0.json";
        }

        // Determine character type
        let characterTypeValue;
        switch (characterType) {
            case true:
                characterTypeValue = currentSeason;
                break;
            case false:
                characterTypeValue = 1;
                break;
            default:
                characterTypeValue = currentSeason;
        }

        // Load the selected template
        const response = await fetch(`./templates/${templateFile}`);
        if (!response.ok) throw new Error(`Failed to load template: ${templateFile}`);
        let templateContent = await response.text();

        // Extract JSON from EPOCH wrapper
        const jsonStart = templateContent.indexOf('{');
        const jsonEnd = templateContent.lastIndexOf('}') + 1;
        const jsonString = templateContent.slice(jsonStart, jsonEnd);

        let characterData = JSON.parse(jsonString);

        // Modify the template with form values
        characterData.characterName = characterName;
        characterData.characterClass = characterClass;
        characterData.hardcore = hardcore;
        characterData.soloChallenge = selfFound;
        characterData.soloCharacterChallenge = selfFound;
        characterData.cycle = characterTypeValue;

        // Stringify without formatting and remove all whitespace
        const compactJSON = JSON.stringify(characterData).replace(/\s+/g, '');

        // Reconstruct the EPOCH wrapper without spaces/newlines
        const modifiedContent = `EPOCH${compactJSON}`;

        // Create download
        const blob = new Blob([modifiedContent], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `1CHARACTERSLOT_BETA_`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Reset the form after successful submission
        form.reset();

        // Trigger change events for Bootstrap switches if needed
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.dispatchEvent(new Event('change'));
        });
    } catch (error) {
        console.error('Error:', error);
        alert(`Error generating character file: ${error.message}`);
    } finally {
        // Always reset button state
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
    }
});

document.getElementById('helpButton').addEventListener('click', function () {
    alert('This form generates a character file for Last Epoch.\n' +
        '1. Enter a character name.\n' +
        '2. Select the timeline depth (0 for base, 1 for Pre-Monolith, 2 for Aberroth).\n' +
        '3. Choose your character class.\n' +
        '4. Select Hardcore and Self-Found options if desired.\n' +
        '5. Select Seasonal or Legacy and click Generate Character File.\n' +
        "6. After you've downloaded your file\n" +
        '   Append the appropriate number to the end of the file name (after the underscore).\n' +
        '   For example, if you have 3 characters, name it 1CHARACTERSLOT_BETA_3.\n' +
        "7. The file gets stored on windows machines at\n" +
        "   '%localappdata%low\Eleventh Hour Games\Last Epoch\Saves'\n" +
        '   And on linux machines (UMMV) at\n' +
        "   '~/.steam/steam/steamapps/compatdata/899770/pfx/drive_c/users/steamuser/AppData/LocalLow/Eleventh Hour Games/Last Epoch/Saves'\n");
});
