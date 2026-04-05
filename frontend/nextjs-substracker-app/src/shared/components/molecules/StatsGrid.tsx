"use client";

import { motion } from "motion/react";

type StatCard = { label: string; value: string };

export default function StatsGrid({ cards }: { cards: StatCard[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">  {/*di default 1 colonna nella groglia, da sm->up sono 3 colonne nella griglia*/}
      {cards.map((stat, i) => (  //stat is current item, i is index
        <motion.div
          key={stat.label}  //quando fai map(), oggni elemento deve avere una key unique
          initial={{ opacity: 0, y: 20 }}  //initial position of the card, opacity 0 and y 20px (down)
          animate={{ opacity: 1, y: 0 }}   //animate to opacity 1 and y 0 (original position)
          transition={{ duration: 0.4, delay: i * 0.1, ease: "easeOut" }}  //transition duration 0.4s, delay based on index (staggered effect: first card -> 0s, second card -> 0.1s, third -> 0.2s, ect), ease out
          className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5"
        >
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">  {/*tracking-wider adds letter spacing makes it look like more 'dashboard' style*/}
            {stat.label}
          </p>
          <p className="mt-2 text-2xl font-semibold tabular-nums">{stat.value}</p>  {/*tabular-nums makes numbers monospaced, each digit has same width. so everything is perfectly aligned*/}
        </motion.div>
      ))}
    </div>
  );
}
