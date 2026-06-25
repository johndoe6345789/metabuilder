/**
 * Profile management handlers for QualityValidator
 */
import { profileManager } from './config/ProfileManager.js';
import { ExitCode } from './types/index.js';
export function handleListProfiles() {
    const profiles = profileManager.getAllProfiles();
    const current = profileManager.getCurrentProfileName();
    console.log('\n' + '='.repeat(70));
    console.log('Available Quality Profiles');
    console.log('='.repeat(70) + '\n');
    for (const profile of profiles) {
        const tag = profile.name === current ? ' (CURRENT)' : '';
        console.log(`${profile.name.toUpperCase()}${tag}`);
        console.log(`  Description: ${profile.description}`);
        console.log(`  Weights: Code Quality: ${profile.weights.codeQuality}, ` +
            `Test Coverage: ${profile.weights.testCoverage}, ` +
            `Architecture: ${profile.weights.architecture}, ` +
            `Security: ${profile.weights.security}`);
        console.log(`  Min Scores: Code Quality: ${profile.minimumScores.codeQuality}, ` +
            `Test Coverage: ${profile.minimumScores.testCoverage}, ` +
            `Architecture: ${profile.minimumScores.architecture}, ` +
            `Security: ${profile.minimumScores.security}`);
        console.log();
    }
    console.log('='.repeat(70));
    console.log('Usage: quality-validator --profile <name>\n');
    return ExitCode.SUCCESS;
}
export function handleShowProfile(profileName) {
    try {
        const profile = profileManager.getProfile(profileName);
        console.log('\n' + '='.repeat(70));
        console.log(`Profile: ${profile.name}`);
        console.log('='.repeat(70) + '\n');
        console.log(JSON.stringify(profile, null, 2));
        console.log('\n' + '='.repeat(70) + '\n');
        return ExitCode.SUCCESS;
    }
    catch (error) {
        console.error(`Error: ${error.message}`);
        return ExitCode.CONFIGURATION_ERROR;
    }
}
export function handleCreateProfile(profileName) {
    console.log(`\nCreating custom profile: ${profileName}`);
    console.log('This feature requires interactive input. ' +
        'Please use the API directly.');
    return ExitCode.SUCCESS;
}
