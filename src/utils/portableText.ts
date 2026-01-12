export function toPlainText(blocks: any[] = []): string {
    if (!blocks || !Array.isArray(blocks)) {
        return '';
    }
    return blocks
        .map(block => {
            if (block._type !== 'block' || !block.children) {
                return '';
            }
            return block.children.map((child: any) => child.text).join('');
        })
        .join('\n\n');
}
