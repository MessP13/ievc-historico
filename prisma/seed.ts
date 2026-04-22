import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const mozambiqueData = [
  {
    name: 'Cabo Delgado',
    districts: [
      'Balama', 'Chiure', 'Ibo', 'Macomia', 'Mecufi', 'Meluco',
      'Mocímboa da Praia', 'Montepuez', 'Mueda', 'Muidumbe',
      'Namuno', 'Nangade', 'Palma', 'Pemba', 'Quissanga'
    ]
  },
  {
    name: 'Niassa',
    districts: [
      'Chimbonila', 'Cuamba', 'Lago', 'Lichinga', 'Majune',
      'Mandimba', 'Marrupa', 'Maúa', 'Mavago', 'Mecanhelas',
      'Mecula', 'Metarica', 'Muembe', 'N\'gauma', 'Ngauma',
      'Nipepe', 'Sanga'
    ]
  },
  {
    name: 'Nampula',
    districts: [
      'Angoche', 'Eráti', 'Ilha de Moçambique', 'Lalaua', 'Larde',
      'Liúpo', 'Malema', 'Meconta', 'Mecubúri', 'Memba',
      'Mogincual', 'Mogovolas', 'Moma', 'Monapo', 'Mossuril',
      'Muecate', 'Murrupula', 'Nacala-a-Velha', 'Nacala Porto',
      'Nacarôa', 'Nampula', 'Rapale', 'Ribaué'
    ]
  },
  {
    name: 'Zambézia',
    districts: [
      'Alto Molócuè', 'Chinde', 'Derre', 'Gilé', 'Guruè',
      'Ile', 'Inhassunge', 'Luabo', 'Lugela', 'Machanga',
      'Maganja da Costa', 'Milange', 'Mocuba', 'Molocue',
      'Mopeia', 'Morrumbala', 'Namacurra', 'Namarroi',
      'Nicoadala', 'Pebane', 'Quelimane'
    ]
  },
  {
    name: 'Tete',
    districts: [
      'Angónia', 'Cahora-Bassa', 'Changara', 'Chifunde', 'Chiuta',
      'Dôa', 'Macanga', 'Marávia', 'Moatize', 'Mutarara',
      'Tete', 'Tsangano', 'Zumbo'
    ]
  },
  {
    name: 'Manica',
    districts: [
      'Báruè', 'Chimoio', 'Gondola', 'Guro', 'Macate',
      'Machaze', 'Macossa', 'Manica', 'Mossurize', 'Sussundenga',
      'Tambara', 'Vanduzi'
    ]
  },
  {
    name: 'Sofala',
    districts: [
      'Beira', 'Buzi', 'Caia', 'Chemba', 'Cheringoma',
      'Chibabava', 'Dondo', 'Gorongosa', 'Machanga', 'Maringue',
      'Marromeu', 'Muanza', 'Nhamatanda'
    ]
  },
  {
    name: 'Inhambane',
    districts: [
      'Funhalouro', 'Govuro', 'Homoíne', 'Ínhambane', 'Inharrime',
      'Inhassoro', 'Jangamo', 'Mabote', 'Massinga', 'Massingir',
      'Maxixe', 'Morrumbene', 'Panda', 'Vilankulo', 'Zavala'
    ]
  },
  {
    name: 'Gaza',
    districts: [
      'Bilene', 'Chibuto', 'Chicualacuala', 'Chigubo', 'Chokwè',
      'Chongoene', 'Guijá', 'Limpopo', 'Mabalane', 'Mandlakaze',
      'Mapai', 'Massangena', 'Massingir', 'Xai-Xai'
    ]
  },
  {
    name: 'Maputo Província',
    districts: [
      'Boane', 'Magude', 'Manhiça', 'Marracuene', 'Matutuíne',
      'Moamba', 'Namaacha'
    ]
  },
  {
    name: 'Maputo Cidade',
    districts: [
      'KaMavota', 'KaMaxaquene', 'KaMpfumo', 'KaMubukwana',
      'KaNyaka', 'KaTembe', 'NLhamankulu'
    ]
  }
]

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.attachment.deleteMany()
  await prisma.answer.deleteMany()
  await prisma.form.deleteMany()
  await prisma.user.deleteMany()
  await prisma.district.deleteMany()
  await prisma.province.deleteMany()

  // Seed provinces and districts
  for (const prov of mozambiqueData) {
    const province = await prisma.province.create({
      data: {
        name: prov.name,
        districts: {
          create: prov.districts.map(d => ({ name: d }))
        }
      }
    })
    console.log(`✅ Province: ${province.name} (${prov.districts.length} districts)`)
  }

  // Create a demo admin user
  await prisma.user.create({
    data: {
      phone: '+258840000000',
      fullName: 'Admin IEVC',
      role: 'ADMIN'
    }
  })

  console.log('✅ Seed completed!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
