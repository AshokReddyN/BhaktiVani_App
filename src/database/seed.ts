import { database } from './index'
import Deity from './models/Deity'
import Stotra from './models/Stotra'

export async function seedDatabase() {
    const deitiesCount = await database.get<Deity>('deities').query().fetchCount()

    if (deitiesCount > 0) {
        console.log('Database already seeded')
        return
    }

    await database.write(async () => {
        // 1. Venkateswara Swamy
        const venkateswara = await database.get<Deity>('deities').create(deity => {
            deity.name = 'వెంకటేశ్వర స్వామి'
            deity.image = 'venkateswara'
        })

        await database.get<Stotra>('stotras').create(stotra => {
            stotra.title = 'వెంకటేశ్వర సుప్రభాతం'
            stotra.content = `కౌసల్యా సుప్రజా రామ పూర్వా సంధ్యా ప్రవర్తతే |
ఉత్తిష్ఠ నరశార్దూల కర్తవ్యం దైవమాహ్నికమ్ ||

ఉత్తిష్ఠోత్తిష్ఠ గోవింద ఉత్తిష్ఠ గరుడధ్వజ |
ఉత్తిష్ఠ కమలాకాంత త్రైలోక్యం మంగళం కురు ||`
            stotra.deity.set(venkateswara)
            stotra.isFavorite = false
        })

        // 2. Ganesha
        const ganesha = await database.get<Deity>('deities').create(deity => {
            deity.name = 'గణేశుడు'
            deity.image = 'ganesha'
        })

        await database.get<Stotra>('stotras').create(stotra => {
            stotra.title = 'గణేశ పంచరత్నం'
            stotra.content = `ముదాకరాత్త మోదకం సదా విముక్తి సాధకం
కళాధరావతంసకం విలాసిలోక రక్షకమ్ |
అనాయకైక నాయకం వినాశితేభ దైత్యకం
నతాశుభాశు నాశకం నమామి తం వినాయకమ్ ||`
            stotra.deity.set(ganesha)
            stotra.isFavorite = false
        })

        // 3. Hanuman
        const hanuman = await database.get<Deity>('deities').create(deity => {
            deity.name = 'హనుమంతుడు'
            deity.image = 'hanuman'
        })

        await database.get<Stotra>('stotras').create(stotra => {
            stotra.title = 'హనుమాన్ చాలీసా'
            stotra.content = `|| దోహా ||
శ్రీ గురు చరన సరోజ రజ నిజమను ముకురు సుధారి |
బరనఉ రఘుబర బిమల జసు జో దాయకు ఫల చారి ||
బుద్ధిహీన తను జానికే సుమిరౌ పవన కుమార |
బల బుద్ధి విద్యా దేహు మోహి హరహు కలేస బికార ||

|| చౌపాఈ ||
జయ హనుమాన జ్ఞాన గున సాగర |
జయ కపీస తిహు లోక ఉజాగర ||
రామదూత అతులిత బలధామా |
అంజని పుత్ర పవనసుత నామా ||`
            stotra.deity.set(hanuman)
            stotra.isFavorite = false
        })

        // 4. Shiva
        const shiva = await database.get<Deity>('deities').create(deity => {
            deity.name = 'శివుడు'
            deity.image = 'shiva'
        })

        await database.get<Stotra>('stotras').create(stotra => {
            stotra.title = 'శివ తాండవ స్తోత్రం'
            stotra.content = `జటాటవీగలజ్జలప్రవాహపావితస్థలే
గలేవలంబ్య లంబితాం భుజంగతుంగమాలికామ్ |
డమడ్డమడ్డమడ్డమన్నినాదవడ్డమర్వయం
చకార చండతాండవం తనోతు నః శివః శివమ్ ||`
            stotra.deity.set(shiva)
            stotra.isFavorite = false
        })

        // 5. Lakshmi Devi
        const lakshmi = await database.get<Deity>('deities').create(deity => {
            deity.name = 'లక్ష్మీదేవి'
            deity.image = 'lakshmi'
        })

        await database.get<Stotra>('stotras').create(stotra => {
            stotra.title = 'మహాలక్ష్మి అష్టకం'
            stotra.content = `నమస్తేస్తు మహామాయే శ్రీపీఠే సురపూజితే |
శంఖచక్ర గదాహస్తే మహాలక్ష్మి నమోస్తుతే ||`
            stotra.deity.set(lakshmi)
            stotra.isFavorite = false
        })

        // 6. Saraswati Devi
        const saraswati = await database.get<Deity>('deities').create(deity => {
            deity.name = 'సరస్వతీ దేవి'
            deity.image = 'saraswati'
        })

        await database.get<Stotra>('stotras').create(stotra => {
            stotra.title = 'సరస్వతీ స్తోత్రం'
            stotra.content = `యా కుందేందు తుషారహారధవళా యా శుభ్రవస్త్రావృతా
యా వీణావరకుండమండితకరా యా శ్వేతపద్మాసనా |
యా బ్రహ్మాచ్యుత శంకరప్రభృతిభిర్దేవైః సదా పూజితా
సా మాం పాతు సరస్వతీ భగవతీ నిశ్శేషజాడ్యాపహా ||`
            stotra.deity.set(saraswati)
            stotra.isFavorite = false
        })

        console.log('Database seeded successfully')
    })
}
