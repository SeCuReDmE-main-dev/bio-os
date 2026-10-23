#!/usr/bin/env node

import { program } from 'commander';
import fs from 'fs';
import chalk from 'chalk';
import crypto from 'crypto';

const CODON_TABLE = {
    'ATA':'I', 'ATC':'I', 'ATT':'I', 'ATG':'M', 'ACA':'T', 'ACC':'T', 'ACG':'T', 'ACT':'T',
    'AAC':'N', 'AAT':'N', 'AAA':'K', 'AAG':'K', 'AGC':'S', 'AGT':'S', 'AGA':'R', 'AGG':'R',
    'CTA':'L', 'CTC':'L', 'CTG':'L', 'CTT':'L', 'CCA':'P', 'CCC':'P', 'CCG':'P', 'CCT':'P',
    'CAC':'H', 'CAT':'H', 'CAA':'Q', 'CAG':'Q', 'CGA':'R', 'CGC':'R', 'CGG':'R', 'CGT':'R',
    'GTA':'V', 'GTC':'V', 'GTG':'V', 'GTT':'V', 'GCA':'A', 'GCC':'A', 'GCG':'A', 'GCT':'A',
    'GAC':'D', 'GAT':'D', 'GAA':'E', 'GAG':'E', 'GGA':'G', 'GGC':'G', 'GGG':'G', 'GGT':'G',
    'TCA':'S', 'TCC':'S', 'TCG':'S', 'TCT':'S', 'TTC':'F', 'TTT':'F', 'TTA':'L', 'TTG':'L',
    'TAC':'Y', 'TAT':'Y', 'TAA':'*', 'TAG':'*', 'TGC':'C', 'TGT':'C', 'TGA':'*', 'TGG':'W',
};

function translateDNA(sequence) {
    let protein = "";
    for (let i = 0; i < sequence.length - 2; i += 3) {
        const codon = sequence.slice(i, i + 3);
        protein += CODON_TABLE[codon] || '?';
    }
    return protein;
}

function analyzeSequence(rawSequence) {
    const sequence = rawSequence.toUpperCase().replace(/[\s\n]/g, '');
    
    console.log(chalk.cyan(`\n🧬 Booting Bio-Kernel...`));
    console.log(chalk.gray(`📏 Sequence Length: ${sequence.length} bp`));
    console.log(chalk.gray("-".repeat(40)));

    // 1. Syntax Check
    if (!/^[ATCG]+$/.test(sequence)) {
        console.log(chalk.red("❌ CRITICAL ERROR: Invalid DNA syntax. Only A, T, C, G allowed."));
        return false;
    }

    // 2. GC Content
    const gcCount = (sequence.match(/[GC]/g) || []).length;
    const gcPercent = (gcCount / sequence.length) * 100;
    console.log(chalk.yellow(`📊 GC Content: ${gcPercent.toFixed(1)}%`));
    
    if (!sequence.startsWith("ATG")) {
        console.log(chalk.red("❌ ERROR: Missing Start Codon (ATG). Ribosome won't bind."));
        return false;
    } else {
        console.log(chalk.green("✅ Start Codon (ATG) verified."));
    }

    if (!["TAA", "TAG", "TGA"].includes(sequence.slice(-3))) {
        console.log(chalk.yellow("⚠️ WARNING: Missing Stop Codon. Protein may be incomplete."));
    }

    // 3. Translation
    const protein = translateDNA(sequence);
    console.log(chalk.magenta(`🧪 Simulated Protein Chain: ${protein.slice(0, 20)}... (Length: ${protein.length})`));
    
    if (protein.slice(0, -1).includes('*')) {
        console.log(chalk.red("❌ ERROR: Premature stop codon found inside the sequence."));
        return false;
    }

    // 4. Leash Token
    const token = crypto.createHash('sha256').update(sequence).digest('hex');
    console.log(chalk.gray("-".repeat(40)));
    console.log(chalk.bgGreen.black(` 🔒 BIO-LEASH TOKEN: 0x${token.slice(0, 16)} `));
    console.log(chalk.green("✅ Status: APPROVED FOR IN-SILICO SANDBOX"));
    return true;
}

program
  .name('bio-os')
  .description('⚠️ Experimental Synthetic Biology Simulator. NOT FOR LAB USE.')
  .version('1.0.0');

program
  .option('-s, --seq <string>', 'Direct DNA sequence string')
  .option('-f, --file <path>', 'Path to a file containing the sequence')
  .action((options) => {
    console.log(chalk.bold.red("\n" + "=".repeat(60)));
    console.log(chalk.bold.red(" ⚠️  BIO-OS v1.0.0 (EXPERIMENTAL SANDBOX) ⚠️"));
    console.log(chalk.bold.red(" NOT FOR LAB OR MEDICAL USE."));
    console.log(chalk.bold.red(" STRICTLY EDUCATIONAL & EXPERIMENTAL USE ONLY."));
    console.log(chalk.bold.red("=".repeat(60)));

    let sequence = options.seq || "";

    if (options.file) {
        try {
            sequence = fs.readFileSync(options.file, 'utf8');
        } catch (err) {
            console.log(chalk.red(`❌ Error: Could not read file ${options.file}`));
            process.exit(1);
        }
    }

    if (!sequence) {
        console.log(chalk.yellow("\n[?] No sequence provided. Use --seq or --file."));
        console.log(chalk.gray("Example: bio-os -s ATGGCCATTGTAATGGGCCGCGCAAAGGGTGCCCGATAA\n"));
        process.exit(1);
    }

    const isSafe = analyzeSequence(sequence);
    
    if (isSafe) {
        console.log(chalk.cyan("\n[→] SIMULATION PASSED. (Remember: Not safe for a real lab).\n"));
        process.exit(0);
    } else {
        console.log(chalk.red("\n[🛑] Sequence blocked by Bio-OS Leash. Physical synthesis denied.\n"));
        process.exit(1);
    }
  });

program.parse();
