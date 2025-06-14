interface RetiredData {
  gender: string;
  birth_date: Date;
  contribution_time: string;
}

export class ScoreCalculatorService {
  static calculateScore(data: RetiredData): string {
    let score = 0;

    if (data.gender === "feminino") {
      score += 5;
    } else if (data.gender === "masculino") {
      score += 3;
    }

    if (data.birth_date) {
      const birthYear = new Date(data.birth_date).getFullYear();
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;

      if (age >= 65) {
        score += 15; // Idade avançada
      } else if (age >= 60) {
        score += 10;
      } else if (age >= 55) {
        score += 5;
      }
    }

    // Pontuação baseada no tempo de contribuição
    if (data.contribution_time) {
      const contributionYears = parseInt(data.contribution_time);
      if (!isNaN(contributionYears)) {
        if (contributionYears >= 35) {
          score += 20; // Tempo de contribuição completo
        } else if (contributionYears >= 30) {
          score += 15;
        } else if (contributionYears >= 25) {
          score += 10;
        } else if (contributionYears >= 15) {
          score += 5;
        }
      }
    }

    const normalizedScore = Math.min(score, 100);

    return normalizedScore.toString();
  }
}
