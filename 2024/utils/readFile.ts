import {promises as fsPromises} from 'fs';

export const readFile = async (path: string): Promise<string> => {
	return await fsPromises.readFile(path, 'utf-8');
};
