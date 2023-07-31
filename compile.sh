#!/bin/bash

# Function to perform find and replace and output to the new file
function find_and_replace() {
    local engine_file="$1"
    local input_file="$2"
    local output_file="$3"
    local find_text="$4"

    # Read the content of the input file
    inputContent=$(<"$input_file")

    # Read the content of the engine file
    engineContent=$(<"$engine_file")

    # Perform find and replace operation
    modified_content="${inputContent//$find_text/"<script> "$engineContent}"

    # Output the modified content to the output file
    echo "$modified_content" > "$output_file"
}

# Usage example:
# Replace "old_text" with "new_text" and output to "output.txt"
find_and_replace "engine.js" "Testing.html" "..\WhirlwindFX\Effects\Testing.html" "<script type=\"text/javascript\" src=\"engine.js\"></script><script>"
find_and_replace "engine.js" "TwoColors.html" "..\WhirlwindFX\Effects\TwoColors.html" "<script type=\"text/javascript\" src=\"engine.js\"></script><script>"
find_and_replace "engine.js" "RotatingWheel.html" "..\WhirlwindFX\Effects\RotatingWheel.html" "<script type=\"text/javascript\" src=\"engine.js\"></script><script>"