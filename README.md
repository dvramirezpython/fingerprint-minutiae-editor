# Minutia editor for fingerprints, palmprints, or fingerphotos.

_Thanks to Google AI studio_

## Run Locally

**Prerequisites:**  Node.js
1. Install dependencies:
   `npm install`
2. Run the app:
   `npm run dev`

**Steps:**
> Load the image
>
> Load the txt file with minutiae previously extracted (optional)
>
> Add minutiae use shortcuts: *B* for bifurcation, *E* for endings, *D* for editing
>
> Modify the type, coordinates, and direction as needed
>
>> The direction can be set by selecting the minutia and clicking in the direction.
>>
>> A minutia can be moved in the picture adjusting its coordinates
>>
>> A minutia type can be modified using the buttons in the left panel
>>
>> A minutia can be removed with the DElete minutia button
>
> Save the minutiae list as a txt with a line per minutia with relative coordinates (x, y), direction in radians (clockwise angle from 0.0 to 6.28), and minutia type (0 -> endings and 1 -> bifurcations)