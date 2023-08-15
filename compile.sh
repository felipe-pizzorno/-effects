#!/bin/bash

base_effects_path="..\WhirlwindFX\Effects"
# Function to perform find and replace and output to the new file
function find_and_replace() {
    local engine_file="$1"
    local input_file="$2"
    local output_file="$base_effects_path\\$2"
    local find_text="$3"

    # Read the content of the input file
    inputContent=$(<"$input_file")

    # Read the content of the engine file
    engineContent=$(<"$engine_file")

    # Perform find and replace operation
    modified_content="${inputContent//$find_text/"<script> "$engineContent}"

    # Output the modified content to the output file
    echo "$modified_content" > "$output_file"
}

# rm "$base_effects_path\\*"

effect_names="Testing TwoColorsMix Gio RotatingWheel StyleRotatingWheel RandomBullshit RandomBullshit2"
for val in $effect_names; do
    find_and_replace "engine.js" "$val.html" "<script type=\"text/javascript\" src=\"engine.js\"></script><script>"
done
