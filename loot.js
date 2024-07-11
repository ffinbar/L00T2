export const Loot = (() => {
    const createLootItem = (item) => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('item');
        let itemBg = document.createElement('div');
        itemBg.classList.add('itembg');
        itemElement.appendChild(itemBg);
        for (const key in item) {
            if (typeof item[key] === 'object') {
                if(Object.keys(item[key]).length === 0) continue;
                const detailsElement = document.createElement('details');
                detailsElement.classList.add(key);
                const summary = document.createElement('summary');
                summary.textContent = key.charAt(0).toUpperCase() + key.slice(1) + ':';
                detailsElement.appendChild(summary);
                for (const [name, description] of Object.entries(item[key])) {
                    const pElement = document.createElement('p');
                    pElement.classList.add(`${key}-name`);
                    pElement.textContent = name;

                    const spanElement = document.createElement('span');
                    spanElement.classList.add(`${key}-description`);
                    spanElement.textContent = `${description}`;
                    let br = document.createElement('br');
                    pElement.appendChild(br);
                    pElement.appendChild(spanElement);

                    detailsElement.appendChild(pElement);
                }
                itemElement.appendChild(detailsElement);
            } else {
                console.log('key:', key);
                if (key === 'image') {
                    console.log('found image');
                    const imgElement = document.createElement('img');
                    imgElement.src = item[key];
                    imgElement.classList.add('itemImg');
                    imgElement.alt = 'item image';
                    itemElement.insertBefore(imgElement, itemElement.childNodes[3]);
                    continue;
                }
                const pElement = document.createElement('p');
                pElement.classList.add(key);
                pElement.textContent = item[key];
                itemElement.appendChild(pElement);
            }
        }
        return itemElement;
    };

    return {
        createLootItem
    };
})();

// Usage:
// const itemElement = Loot.createLootItem(item);
// document.body.appendChild(itemElement);

