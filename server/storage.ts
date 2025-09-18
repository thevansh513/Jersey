import { type User, type InsertUser, type CricketPlayer, type InsertCricketPlayer, type GameScore, type InsertGameScore } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllCricketPlayers(): Promise<CricketPlayer[]>;
  getCricketPlayer(id: string): Promise<CricketPlayer | undefined>;
  createCricketPlayer(player: InsertCricketPlayer): Promise<CricketPlayer>;
  saveGameScore(score: InsertGameScore): Promise<GameScore>;
  getTopScores(): Promise<GameScore[]>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private cricketPlayers: Map<string, CricketPlayer>;
  private gameScores: Map<string, GameScore>;

  constructor() {
    this.users = new Map();
    this.cricketPlayers = new Map();
    this.gameScores = new Map();
    this.initializeCricketPlayers();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllCricketPlayers(): Promise<CricketPlayer[]> {
    return Array.from(this.cricketPlayers.values());
  }

  async getCricketPlayer(id: string): Promise<CricketPlayer | undefined> {
    return this.cricketPlayers.get(id);
  }

  async createCricketPlayer(insertPlayer: InsertCricketPlayer): Promise<CricketPlayer> {
    const id = randomUUID();
    const player: CricketPlayer = { ...insertPlayer, id };
    this.cricketPlayers.set(id, player);
    return player;
  }

  async saveGameScore(insertScore: InsertGameScore): Promise<GameScore> {
    const id = randomUUID();
    const score: GameScore = { 
      playerName: insertScore.playerName ?? null,
      level: insertScore.level,
      correctAnswers: insertScore.correctAnswers ?? 0,
      wrongAnswers: insertScore.wrongAnswers ?? 0,
      skippedAnswers: insertScore.skippedAnswers ?? 0,
      id, 
      completedAt: new Date().toISOString() 
    };
    this.gameScores.set(id, score);
    return score;
  }

  async getTopScores(): Promise<GameScore[]> {
    return Array.from(this.gameScores.values())
      .sort((a, b) => b.correctAnswers - a.correctAnswers)
      .slice(0, 10);
  }

  private initializeCricketPlayers() {
    const players: InsertCricketPlayer[] = [
      // EASY DIFFICULTY - Very famous players (Levels 1-5)
      { name: "MS Dhoni", jersey: 7, hint: "Captain Cool - Known for his calm finishing and helicopter shot", team: "India", difficulty: "easy" },
      { name: "Virat Kohli", jersey: 18, hint: "Run machine and former Indian captain, known for his aggressive batting", team: "India", difficulty: "easy" },
      { name: "Rohit Sharma", jersey: 45, hint: "Hitman - Known for his elegant stroke play and multiple double centuries", team: "India", difficulty: "easy" },
      { name: "AB de Villiers", jersey: 17, hint: "Mr. 360 - Known for his innovative shots all around the ground", team: "South Africa", difficulty: "easy" },
      { name: "Chris Gayle", jersey: 45, hint: "Universe Boss - Known for his explosive batting", team: "West Indies", difficulty: "easy" },
      { name: "Steve Smith", jersey: 49, hint: "Former Australian captain with unorthodox batting technique", team: "Australia", difficulty: "easy" },
      { name: "David Warner", jersey: 31, hint: "Aggressive left-handed opener known for his quick scoring", team: "Australia", difficulty: "easy" },
      { name: "Kane Williamson", jersey: 22, hint: "New Zealand captain known for his calm demeanor", team: "New Zealand", difficulty: "easy" },
      { name: "Joe Root", jersey: 66, hint: "Former English captain and classical batsman", team: "England", difficulty: "easy" },
      { name: "Ben Stokes", jersey: 55, hint: "All-rounder known for his match-winning performances", team: "England", difficulty: "easy" },
      { name: "Babar Azam", jersey: 56, hint: "Pakistani captain known for his elegant batting", team: "Pakistan", difficulty: "easy" },
      { name: "Lasith Malinga", jersey: 99, hint: "Slinga Malinga - Known for his yorkers and action", team: "Sri Lanka", difficulty: "easy" },
      { name: "Shakib Al Hasan", jersey: 75, hint: "All-rounder and former Bangladeshi captain", team: "Bangladesh", difficulty: "easy" },
      { name: "Andre Russell", jersey: 12, hint: "All-rounder known for his explosive batting and bowling", team: "West Indies", difficulty: "easy" },
      { name: "Hardik Pandya", jersey: 33, hint: "All-rounder known for his explosive batting and bowling", team: "India", difficulty: "easy" },
      { name: "Jasprit Bumrah", jersey: 93, hint: "Yorker specialist and India's premier fast bowler", team: "India", difficulty: "easy" },
      { name: "Trent Boult", jersey: 18, hint: "Left-arm fast bowler known for his swing", team: "New Zealand", difficulty: "easy" },
      { name: "Jos Buttler", jersey: 63, hint: "Wicket-keeper known for his explosive batting", team: "England", difficulty: "easy" },
      { name: "Kagiso Rabada", jersey: 25, hint: "Fast bowler known for his pace and aggression", team: "South Africa", difficulty: "easy" },
      { name: "Rashid Khan", jersey: 19, hint: "Afghan leg-spinner known worldwide", team: "Afghanistan", difficulty: "easy" },
      { name: "Yuvraj Singh", jersey: 12, hint: "2011 World Cup hero known for his six sixes", team: "India", difficulty: "easy" },
      { name: "Suresh Raina", jersey: 3, hint: "Mr. IPL - Known for his consistent performances in IPL", team: "India", difficulty: "easy" },
      { name: "Kieron Pollard", jersey: 55, hint: "All-rounder known for his power hitting", team: "West Indies", difficulty: "easy" },
      { name: "Glenn Maxwell", jersey: 32, hint: "Big Show - Known for his innovative shots and part-time spin", team: "Australia", difficulty: "easy" },
      { name: "Faf du Plessis", jersey: 18, hint: "Former South African captain known for his technique", team: "South Africa", difficulty: "easy" },
      
      // MEDIUM DIFFICULTY - Well-known players (Levels 6-12)
      { name: "KL Rahul", jersey: 1, hint: "Stylish opener and wicket-keeper batsman", team: "India", difficulty: "medium" },
      { name: "Rishabh Pant", jersey: 17, hint: "Young wicket-keeper known for his aggressive batting", team: "India", difficulty: "medium" },
      { name: "Ravindra Jadeja", jersey: 8, hint: "Sir Jadeja - All-rounder known for his fielding and left-arm spin", team: "India", difficulty: "medium" },
      { name: "Shikhar Dhawan", jersey: 25, hint: "Gabbar - Aggressive left-handed opener", team: "India", difficulty: "medium" },
      { name: "Pat Cummins", jersey: 30, hint: "Australian captain and fast bowler known for his pace", team: "Australia", difficulty: "medium" },
      { name: "Aaron Finch", jersey: 5, hint: "Former Australian captain and explosive opener", team: "Australia", difficulty: "medium" },
      { name: "Mitchell Starc", jersey: 56, hint: "Left-arm fast bowler known for his yorkers", team: "Australia", difficulty: "medium" },
      { name: "Eoin Morgan", jersey: 16, hint: "Former Irish-English captain known for his leadership", team: "England", difficulty: "medium" },
      { name: "Jonny Bairstow", jersey: 21, hint: "Wicket-keeper batsman known for his aggressive style", team: "England", difficulty: "medium" },
      { name: "Quinton de Kock", jersey: 21, hint: "Left-handed wicket-keeper batsman", team: "South Africa", difficulty: "medium" },
      { name: "David Miller", jersey: 9, hint: "Killer Miller - Known for his finishing abilities", team: "South Africa", difficulty: "medium" },
      { name: "Mohammad Rizwan", jersey: 12, hint: "Wicket-keeper batsman known for his consistency", team: "Pakistan", difficulty: "medium" },
      { name: "Shaheen Afridi", jersey: 10, hint: "Left-arm fast bowler known for his swing", team: "Pakistan", difficulty: "medium" },
      { name: "Martin Guptill", jersey: 31, hint: "Aggressive opener known for his power hitting", team: "New Zealand", difficulty: "medium" },
      { name: "Ross Taylor", jersey: 4, hint: "Middle-order batsman and former captain", team: "New Zealand", difficulty: "medium" },
      { name: "Angelo Mathews", jersey: 6, hint: "All-rounder and former Sri Lankan captain", team: "Sri Lanka", difficulty: "medium" },
      { name: "Mushfiqur Rahim", jersey: 15, hint: "Wicket-keeper batsman and experienced player", team: "Bangladesh", difficulty: "medium" },
      { name: "Tamim Iqbal", jersey: 28, hint: "Left-handed opener and experienced batsman", team: "Bangladesh", difficulty: "medium" },
      { name: "Jason Holder", jersey: 8, hint: "All-rounder and former West Indies captain", team: "West Indies", difficulty: "medium" },
      { name: "Nicholas Pooran", jersey: 2, hint: "Wicket-keeper batsman known for his aggressive style", team: "West Indies", difficulty: "medium" },
      { name: "Yuzvendra Chahal", jersey: 3, hint: "Leg-spinner known for his wicket-taking ability", team: "India", difficulty: "medium" },
      { name: "Mohammad Nabi", jersey: 10, hint: "Afghan all-rounder and captain", team: "Afghanistan", difficulty: "medium" },
      { name: "Harbhajan Singh", jersey: 6, hint: "Turbanator - Off-spinner known for his doosra", team: "India", difficulty: "medium" },
      { name: "Gautam Gambhir", jersey: 5, hint: "Former Indian opener and captain", team: "India", difficulty: "medium" },
      { name: "Dwayne Bravo", jersey: 47, hint: "All-rounder known for his death bowling", team: "West Indies", difficulty: "medium" },
      
      // HARD DIFFICULTY - Lesser known but recognizable players (Levels 13-18)
      { name: "Josh Hazlewood", jersey: 58, hint: "Consistent fast bowler with excellent line and length", team: "Australia", difficulty: "hard" },
      { name: "Adam Zampa", jersey: 66, hint: "Leg-spinner and key wicket-taker in limited overs", team: "Australia", difficulty: "hard" },
      { name: "Marcus Stoinis", jersey: 59, hint: "All-rounder known for his power hitting", team: "Australia", difficulty: "hard" },
      { name: "Alex Carey", jersey: 62, hint: "Wicket-keeper batsman known for his consistent performances", team: "Australia", difficulty: "hard" },
      { name: "Jason Roy", jersey: 10, hint: "Aggressive opener known for his quick starts", team: "England", difficulty: "hard" },
      { name: "Liam Livingstone", jersey: 42, hint: "All-rounder known for his big hitting ability", team: "England", difficulty: "hard" },
      { name: "Jofra Archer", jersey: 22, hint: "Fast bowler known for his pace and variations", team: "England", difficulty: "hard" },
      { name: "Adil Rashid", jersey: 19, hint: "Leg-spinner and key bowler in limited overs", team: "England", difficulty: "hard" },
      { name: "Mark Wood", jersey: 91, hint: "Express fast bowler known for his raw pace", team: "England", difficulty: "hard" },
      { name: "Aiden Markram", jersey: 4, hint: "Right-handed batsman and part-time off-spinner", team: "South Africa", difficulty: "hard" },
      { name: "Lungi Ngidi", jersey: 5, hint: "Fast bowler known for his bounce and pace", team: "South Africa", difficulty: "hard" },
      { name: "Rassie van der Dussen", jersey: 3, hint: "Middle-order batsman known for his consistency", team: "South Africa", difficulty: "hard" },
      { name: "Anrich Nortje", jersey: 16, hint: "Express fast bowler with raw pace", team: "South Africa", difficulty: "hard" },
      { name: "Tabraiz Shamsi", jersey: 99, hint: "Left-arm wrist spinner known for his variations", team: "South Africa", difficulty: "hard" },
      { name: "Fakhar Zaman", jersey: 19, hint: "Left-handed opener known for his aggressive batting", team: "Pakistan", difficulty: "hard" },
      { name: "Mohammad Hafeez", jersey: 6, hint: "All-rounder known as 'The Professor'", team: "Pakistan", difficulty: "hard" },
      { name: "Shadab Khan", jersey: 18, hint: "Leg-spinner and lower-order batsman", team: "Pakistan", difficulty: "hard" },
      { name: "Hasan Ali", jersey: 1, hint: "Fast bowler known for his celebratory style", team: "Pakistan", difficulty: "hard" },
      { name: "Tom Latham", jersey: 2, hint: "Wicket-keeper batsman and opening option", team: "New Zealand", difficulty: "hard" },
      { name: "Tim Southee", jersey: 38, hint: "Fast bowler and experienced campaigner", team: "New Zealand", difficulty: "hard" },
      { name: "Mitchell Santner", jersey: 12, hint: "Left-arm spinner and lower-order batsman", team: "New Zealand", difficulty: "hard" },
      { name: "Devon Conway", jersey: 17, hint: "Left-handed batsman who can keep wickets", team: "New Zealand", difficulty: "hard" },
      { name: "Kyle Jamieson", jersey: 8, hint: "Tall fast bowler known for his bounce", team: "New Zealand", difficulty: "hard" },
      { name: "Ish Sodhi", jersey: 14, hint: "Leg-spinner known for his wicket-taking ability", team: "New Zealand", difficulty: "hard" },
      { name: "Kusal Mendis", jersey: 13, hint: "Right-handed batsman known for his stroke play", team: "Sri Lanka", difficulty: "hard" },
      { name: "Dhananjaya de Silva", jersey: 12, hint: "All-rounder known for his off-spin and batting", team: "Sri Lanka", difficulty: "hard" },
      { name: "Thisara Perera", jersey: 77, hint: "All-rounder known for his power hitting", team: "Sri Lanka", difficulty: "hard" },
      { name: "Wanindu Hasaranga", jersey: 8, hint: "Leg-spinner and handy lower-order batsman", team: "Sri Lanka", difficulty: "hard" },
      { name: "Mahmudullah", jersey: 30, hint: "All-rounder known for his finishing abilities", team: "Bangladesh", difficulty: "hard" },
      { name: "Mustafizur Rahman", jersey: 90, hint: "Left-arm fast bowler known as 'The Fizz'", team: "Bangladesh", difficulty: "hard" },
      { name: "Litton Das", jersey: 9, hint: "Wicket-keeper batsman known for his technique", team: "Bangladesh", difficulty: "hard" },
      { name: "Evin Lewis", jersey: 20, hint: "Left-handed opener known for his power hitting", team: "West Indies", difficulty: "hard" },
      { name: "Shimron Hetmyer", jersey: 11, hint: "Left-handed batsman known for his stroke play", team: "West Indies", difficulty: "hard" },
      { name: "Sunil Narine", jersey: 74, hint: "Spinner known for his mystery deliveries", team: "West Indies", difficulty: "hard" },
      { name: "Alzarri Joseph", jersey: 5, hint: "Fast bowler known for his pace and bounce", team: "West Indies", difficulty: "hard" },
      { name: "Asghar Afghan", jersey: 23, hint: "Former Afghan captain and middle-order batsman", team: "Afghanistan", difficulty: "hard" },
      { name: "Mujeeb Ur Rahman", jersey: 28, hint: "Young Afghan spinner with variations", team: "Afghanistan", difficulty: "hard" },
      { name: "Hazratullah Zazai", jersey: 11, hint: "Afghan opener known for his big hitting", team: "Afghanistan", difficulty: "hard" },
      { name: "Sikandar Raza", jersey: 25, hint: "Zimbabwean all-rounder and experienced player", team: "Zimbabwe", difficulty: "hard" },
      { name: "Brendan Taylor", jersey: 6, hint: "Former Zimbabwean captain and wicket-keeper", team: "Zimbabwe", difficulty: "hard" },
      { name: "Ajinkya Rahane", jersey: 1, hint: "Test specialist known for his overseas performances", team: "India", difficulty: "hard" },
      { name: "Mohammad Shami", jersey: 11, hint: "Fast bowler known for his reverse swing", team: "India", difficulty: "hard" },
      
      // EXPERT DIFFICULTY - Most obscure players (Levels 19-20)
      { name: "Imam-ul-Haq", jersey: 2, hint: "Left-handed opener and nephew of Inzamam", team: "Pakistan", difficulty: "expert" },
      { name: "Asif Ali", jersey: 37, hint: "Power hitter known for his big-hitting ability", team: "Pakistan", difficulty: "expert" },
      { name: "Mohammad Wasim Jr", jersey: 20, hint: "Young fast bowler with good pace", team: "Pakistan", difficulty: "expert" },
      { name: "Pathum Nissanka", jersey: 14, hint: "Opening batsman known for his technique", team: "Sri Lanka", difficulty: "expert" },
      { name: "Chamika Karunaratne", jersey: 16, hint: "Fast bowler and useful lower-order batsman", team: "Sri Lanka", difficulty: "expert" },
      { name: "Avishka Fernando", jersey: 4, hint: "Top-order batsman known for his stroke play", team: "Sri Lanka", difficulty: "expert" },
      { name: "Bhanuka Rajapaksa", jersey: 36, hint: "Left-handed batsman known for his aggressive style", team: "Sri Lanka", difficulty: "expert" },
      { name: "Mehidy Hasan Miraz", jersey: 27, hint: "Off-spinner and lower-order batsman", team: "Bangladesh", difficulty: "expert" },
      { name: "Soumya Sarkar", jersey: 39, hint: "All-rounder known for his aggressive batting", team: "Bangladesh", difficulty: "expert" },
      { name: "Taskin Ahmed", jersey: 17, hint: "Fast bowler known for his pace", team: "Bangladesh", difficulty: "expert" },
      { name: "Afif Hossain", jersey: 19, hint: "Left-handed batsman and part-time spinner", team: "Bangladesh", difficulty: "expert" },
      { name: "Ryan Burl", jersey: 27, hint: "Zimbabwean all-rounder", team: "Zimbabwe", difficulty: "expert" },
      { name: "Craig Ervine", jersey: 4, hint: "Zimbabwean captain and left-handed batsman", team: "Zimbabwe", difficulty: "expert" },
      { name: "Blessing Muzarabani", jersey: 8, hint: "Zimbabwean fast bowler", team: "Zimbabwe", difficulty: "expert" },
      { name: "Cheteshwar Pujara", jersey: 3, hint: "Test specialist known for his patience", team: "India", difficulty: "expert" },
      { name: "Ishant Sharma", jersey: 29, hint: "Tall fast bowler and experienced campaigner", team: "India", difficulty: "expert" },
      { name: "Umesh Yadav", jersey: 9, hint: "Fast bowler known for his pace", team: "India", difficulty: "expert" },
      { name: "Bhuvneshwar Kumar", jersey: 15, hint: "Swing bowler known for his new ball skills", team: "India", difficulty: "expert" }
    ];

    players.forEach(async (player) => {
      await this.createCricketPlayer(player);
    });
  }
}

export const storage = new MemStorage();
