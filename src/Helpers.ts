export function strToSlug(value: string) {
    value = value.replace(/^\s+|\s+$/g, ""); // trim
    value = value.toLowerCase();

    // remove accents, swap ñ for n, etc
    const from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
    const to   = "aaaaeeeeiiiioooouuuunc------";
    for (let i=0, l=from.length ; i<l ; i++) {
        value = value.replace(new RegExp(from.charAt(i), "g"), to.charAt(i));
    }

    return value.replace(/[^a-z0-9 -]/g, "") // remove invalid chars
        .replace(/\s+/g, "-") // collapse whitespace and replace by -
        .replace(/-+/g, "-"); // collapse dashes
}

export default { strToSlug };
