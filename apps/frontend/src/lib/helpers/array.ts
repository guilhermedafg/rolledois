export function shuffleArray<T = unknown>(array: Array<T>) {
    const shuffledArray = Array.from(array);

    for (let index = shuffledArray.length - 1; index > 0; index--) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffledArray[index], shuffledArray[randomIndex]] = [
            shuffledArray[randomIndex],
            shuffledArray[index],
        ];
    }

    return shuffledArray;
}
