import { Info, Eletto, schede, elettori, seggi, query, candidati } from './parser.model';
const pdf2table = require('pdf2table');
const fs = require('fs');

class Parser {
    private info: Info;
    private doc: Target;
    private fileName: string;

    constructor(fileName: string, dip: any) {
        this.fileName = fileName;

        this.info = {
            schede: {},
            liste: [],
            eletti: []
        }

        switch (dip) {
            case 0:
                this.doc = new Dipartimento;
                break;
            default:
                this.doc = new Organo();
                break;
        }
    }

    private write(): void {
        const data = JSON.stringify(this.info, null, 4);
        fs.writeFile(this.fileName.replace('.pdf', '') + '.json', data, (errW: any) => {

            if (errW) {
                throw errW;
            }

            console.log('JSON data is saved.');
        });
    }

    public scrape(): void {
        fs.readFile(this.fileName, (errR: any, buffer: any) => {

            if (errR) {
                return console.log(errR);
            }

            pdf2table.parse(buffer, (errP: any, data: any[]) => {
                if (errP)
                    return console.log(errP);

                this.doc.scrapeLists(this.info, data);
                let idxList = -1;

                data.forEach((el: any[]) => {
                    if (this.doc.checkEletto(el)) {
                        const eletto: Eletto = {
                            nominativo: el[0],
                            voti: el[1],
                            lista: this.info.liste[idxList]
                        };
                        this.info.eletti.push(eletto);
                    }

                    switch (el[0]) {
                        case schede.BIANCHE:
                        case schede.NULLE:
                        case schede.CONTESTATE:
                            this.info.schede[el[0]] = el[1];
                            break;
                        case elettori.TUTTI:
                            this.info.elettori = el[1];
                            break;
                        case elettori.VOTANTI:
                            this.info.votanti = el[1];
                            break;
                    }

                    if (el[0].includes(seggi.SCRUTINATI)) {
                        idxList++;
                    }
                });
                this.write();
            });
        });
    }
}

interface Target {
    scrapeLists(info: Info, data: object): void;
    scrapeOther(info: Info, data: object): void;
    checkEletto(data: object): boolean;
}

class Dipartimento implements Target {
    public scrapeLists(info: Info, data: any[][]): void {
        for (let i = 0; i < data.length; i++) {

            if (data[i][0].includes(query.DIPARTIMENTO)) {
                info.dipartimento = data[++i][0];
            }

            if (data[i][0].includes(candidati.LISTE_DIP)) {
                i = i + 2;
                while (!data[i][0].includes(candidati.VOTI) && !data[i][0].includes(schede.BIANCHE)) {
                    info.liste.push(data[i][0]);
                    i++;
                }
            }
        }
    }

    public scrapeOther(info: Info, data: string[]): void {
        if (data[0] === seggi.DA_ASSEGNARE_DIP) {
            info.seggi_da_assegnare = data[1];
        }
    }

    public checkEletto(data: string[]): boolean {
        return data[2] === candidati.ELETTO_DIP;
    }
}

class Organo implements Target {

    public scrapeLists(info: Info, data: string[]): void {
        for (let i = 0; i < data.length; i++) {

            if (data[i][0].includes(query.ORGANI)) {
                info.organo = data[i][0];
            }

            if (data[i][0].includes(candidati.LISTE_ORG)) {
                while (!data[++i][0].includes(candidati.VOTI) && !data[i][0].includes(schede.BIANCHE)) {
                    info.liste.push(data[i][0]);
                }
            }
        }
    }

    public scrapeOther(info: Info, data: string[]): void {
        if (data[1] === seggi.DA_ASSEGNARE_ORG) {
            info.seggi_da_assegnare = data[2];
        }
    }

    public checkEletto(data: string[]): boolean {
        return data[2] === candidati.ELETTO_ORG;
    }
}

const fileName = process.argv[2];
const mode = parseInt(process.argv[3]);
const creator = new Parser(fileName, mode);
creator.scrape();