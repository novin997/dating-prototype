import type { Profile } from "./types";

/** Fictional profiles. Every card shown to respondents is tagged "Sample profile". */
export const SAMPLE_PROFILES: Profile[] = [
  // Men
  { id: "s01", name: "Wei Jie", age: 29, gender: "man", area: "east", freeEvenings: 2, budget: 40, lookingFor: ["woman"], ageMin: 24, ageMax: 33, blurb: "Hawker centre hunter, will queue for good chicken rice." },
  { id: "s02", name: "Arjun", age: 32, gender: "man", area: "central", freeEvenings: 1, budget: 80, lookingFor: ["woman"], ageMin: 26, ageMax: 36, blurb: "Works long hours in audit; free evenings are precious." },
  { id: "s03", name: "Hafiz", age: 27, gender: "man", area: "north", freeEvenings: 3, budget: 30, lookingFor: ["woman"], ageMin: 23, ageMax: 32, blurb: "Weekend cyclist, happy with a park walk and teh." },
  { id: "s04", name: "Marcus", age: 35, gender: "man", area: "west", freeEvenings: 2, budget: 100, lookingFor: ["woman"], ageMin: 28, ageMax: 40, blurb: "Engineer who cooks better than he talks." },
  { id: "s05", name: "Jun Hao", age: 24, gender: "man", area: "south", freeEvenings: 4, budget: 25, lookingFor: ["woman"], ageMin: 21, ageMax: 28, blurb: "Fresh grad, board games over fine dining." },
  { id: "s06", name: "Daniel", age: 31, gender: "man", area: "east", freeEvenings: 3, budget: 60, lookingFor: ["woman"], ageMin: 26, ageMax: 35, blurb: "East Coast Park regular, sunset jogs." },
  { id: "s07", name: "Ravi", age: 38, gender: "man", area: "central", freeEvenings: 2, budget: 120, lookingFor: ["woman"], ageMin: 30, ageMax: 42, blurb: "Teacher; school holidays are when I come alive." },
  { id: "s08", name: "Kai Xiang", age: 30, gender: "man", area: "west", freeEvenings: 1, budget: 50, lookingFor: ["woman", "nonbinary"], ageMin: 25, ageMax: 34, blurb: "Shift worker, prefers short weekday coffee dates." },
  { id: "s09", name: "Faizal", age: 33, gender: "man", area: "east", freeEvenings: 2, budget: 45, lookingFor: ["woman"], ageMin: 27, ageMax: 37, blurb: "Saving for a BTO, so cheap eats are a feature." },
  { id: "s10", name: "Ben", age: 42, gender: "man", area: "south", freeEvenings: 3, budget: 150, lookingFor: ["woman"], ageMin: 33, ageMax: 45, blurb: "Likes museums on free-entry days." },
  { id: "s11", name: "Ethan", age: 28, gender: "man", area: "central", freeEvenings: 2, budget: 70, lookingFor: ["man"], ageMin: 24, ageMax: 34, blurb: "Bouldering most weekends, ramen after." },
  { id: "s12", name: "Zhi Wei", age: 34, gender: "man", area: "north", freeEvenings: 1, budget: 60, lookingFor: ["man"], ageMin: 28, ageMax: 40, blurb: "Quiet dinners, good playlists." },
  // Women
  { id: "s13", name: "Hui Min", age: 28, gender: "woman", area: "east", freeEvenings: 2, budget: 50, lookingFor: ["man"], ageMin: 26, ageMax: 34, blurb: "Nurse on rotating shifts; plans fall through a lot." },
  { id: "s14", name: "Priya", age: 30, gender: "woman", area: "central", freeEvenings: 2, budget: 70, lookingFor: ["man"], ageMin: 27, ageMax: 36, blurb: "Lawyer, busiest before quarter end." },
  { id: "s15", name: "Nurul", age: 26, gender: "woman", area: "north", freeEvenings: 3, budget: 30, lookingFor: ["man"], ageMin: 24, ageMax: 32, blurb: "Bakes on weekends, loves a long walk at the reservoir." },
  { id: "s16", name: "Rachel", age: 33, gender: "woman", area: "west", freeEvenings: 1, budget: 90, lookingFor: ["man"], ageMin: 29, ageMax: 40, blurb: "Consultant, mostly free on Sundays." },
  { id: "s17", name: "Jia Yi", age: 23, gender: "woman", area: "south", freeEvenings: 4, budget: 25, lookingFor: ["man"], ageMin: 21, ageMax: 29, blurb: "Grad student, knows every free event in town." },
  { id: "s18", name: "Siti", age: 31, gender: "woman", area: "east", freeEvenings: 2, budget: 40, lookingFor: ["man"], ageMin: 28, ageMax: 38, blurb: "Kopi and kaya toast is a perfect date." },
  { id: "s19", name: "Meera", age: 36, gender: "woman", area: "central", freeEvenings: 2, budget: 110, lookingFor: ["man"], ageMin: 32, ageMax: 44, blurb: "Product manager; calendar is the enemy." },
  { id: "s20", name: "Charlotte", age: 29, gender: "woman", area: "west", freeEvenings: 3, budget: 60, lookingFor: ["man", "woman"], ageMin: 25, ageMax: 35, blurb: "Hiker, Bukit Timah at 7am counts as a date." },
  { id: "s21", name: "Xin Yi", age: 32, gender: "woman", area: "north", freeEvenings: 1, budget: 55, lookingFor: ["man"], ageMin: 28, ageMax: 38, blurb: "Accountant, tax season is a write-off." },
  { id: "s22", name: "Aisha", age: 40, gender: "woman", area: "south", freeEvenings: 3, budget: 130, lookingFor: ["man"], ageMin: 34, ageMax: 46, blurb: "Loves theatre, happy to find the cheap seats." },
  { id: "s23", name: "Grace", age: 27, gender: "woman", area: "central", freeEvenings: 2, budget: 45, lookingFor: ["woman"], ageMin: 24, ageMax: 33, blurb: "Film nights and late suppers." },
  { id: "s24", name: "Li Ting", age: 35, gender: "woman", area: "east", freeEvenings: 2, budget: 65, lookingFor: ["woman"], ageMin: 29, ageMax: 41, blurb: "Pottery classes and dumplings." },
  // Non-binary
  { id: "s25", name: "Sam", age: 26, gender: "nonbinary", area: "central", freeEvenings: 3, budget: 35, lookingFor: ["woman", "man", "nonbinary"], ageMin: 22, ageMax: 32, blurb: "Zine maker, café hopper." },
  { id: "s26", name: "Alex", age: 31, gender: "nonbinary", area: "east", freeEvenings: 2, budget: 50, lookingFor: ["woman", "nonbinary"], ageMin: 26, ageMax: 37, blurb: "Designer who runs on bubble tea." },
  { id: "s27", name: "Jo", age: 29, gender: "nonbinary", area: "west", freeEvenings: 2, budget: 40, lookingFor: ["man", "nonbinary"], ageMin: 25, ageMax: 35, blurb: "Plays in a weekend band." },
  { id: "s28", name: "Rin", age: 34, gender: "nonbinary", area: "north", freeEvenings: 1, budget: 70, lookingFor: ["woman", "man", "nonbinary"], ageMin: 28, ageMax: 42, blurb: "Researcher, best reached after deadlines." },
  { id: "s29", name: "Kim", age: 23, gender: "nonbinary", area: "south", freeEvenings: 4, budget: 20, lookingFor: ["woman", "man", "nonbinary"], ageMin: 21, ageMax: 30, blurb: "Library dates are underrated." },
  { id: "s30", name: "Noor", age: 37, gender: "nonbinary", area: "east", freeEvenings: 2, budget: 90, lookingFor: ["man", "woman"], ageMin: 30, ageMax: 44, blurb: "Volunteers on weekends, dinner after." },
];
