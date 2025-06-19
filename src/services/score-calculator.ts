interface RetiredData {
  gender: string;
  birth_date: Date;
  contribution_time: string;
}

export class ScoreCalculatorService {
  static calculateScore(data: RetiredData): number {
    const gender = data.gender.toLowerCase();
    const contributionTime =
      ScoreCalculatorService.parseContributionTime(data.contribution_time) ?? 0;
    const ageMonths = ScoreCalculatorService.calculateAgeInMonths(
      data.birth_date
    );

    // Jovens (<55 anos)
    if (ageMonths < 58 * 12) {
      return 80;
    }

    // Mulheres
    if (gender === "f") {
      if (ageMonths >= 64 * 12 + 8 && contributionTime < 15) {
        return 90; // LOAS
      } else if (ageMonths < 61 * 12 + 8 && contributionTime >= 15) {
        return 91; // Aniversário
      } else if (ageMonths >= 61 * 12 + 8 && contributionTime >= 15) {
        return 92; // Aposentadoria
      } else {
        return 85; // Fallback feminino
      }
    }

    // Homens
    if (gender === "m") {
      if (ageMonths < 64 * 12 + 8) {
        return 96; // Aniversário
      } else if (ageMonths >= 64 * 12 + 8 && contributionTime < 15) {
        return 97; // LOAS
      } else if (ageMonths >= 64 * 12 + 8 && contributionTime >= 15) {
        return 98; // Aposentadoria
      } else {
        return 85; // Fallback masculino
      }
    }

    // Qualquer caso não previsto
    return 50;
  }

  static parseContributionTime(input: string): number | null {
    if (!input) {
      return null;
    }

    const cleaned = input.toLowerCase().trim();

    if (cleaned.includes("entre 5 e 10 anos")) {
      return 5;
    } else if (cleaned.includes("entre 10 e 15 anos")) {
      return 10;
    } else if (
      cleaned.includes("entre 15 e 20 anos") ||
      cleaned.includes("entre 15 e 25 anos")
    ) {
      return 15;
    } else if (cleaned.includes("entre 20 e 25 anos")) {
      return 20;
    } else if (
      cleaned.includes("entre 25 e 30 anos") ||
      cleaned.includes("entre 25 e 35 anos")
    ) {
      return 25;
    } else if (cleaned.includes("entre 30 e 35 anos")) {
      return 30;
    } else if (cleaned.includes("mais de 35 anos")) {
      return 35;
    } else if (cleaned.includes("menos de 15 anos")) {
      return 10;
    }

    return null;
  }

  static calculateAgeInMonths(birthDate: Date): number {
    const currentDate = new Date();
    const ageYears = currentDate.getFullYear() - birthDate.getFullYear();
    const ageMonths = currentDate.getMonth() - birthDate.getMonth();

    return ageYears * 12 + ageMonths;
  }
}
