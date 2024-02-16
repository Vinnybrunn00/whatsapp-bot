const sysinfo = async (model, system, ip, free, total) => {
    return `
 • Host Info

    Modelo: \`\`\`${model} \`\`\`
    Sistema: \`\`\`${system} \`\`\`
    ip Host: \`\`\`${ip} \`\`\`
    Memoria Livre: \`\`\`${free} \`\`\`
    Memoria Total: \`\`\`${total} \`\`\`
`
}

exports.sysinfo = sysinfo